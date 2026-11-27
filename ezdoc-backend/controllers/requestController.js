const Request = require('../models/Request');
const Ambulance = require('../models/ambulance');
const { findNearest } = require('../utils/distance');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Without a key the app still works: SOS requests are simply saved without AI triage
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Status flow of an SOS request (same list as the Request model)
const VALID_STATUSES = ['pending', 'accepted', 'on_the_way', 'arrived', 'completed'];

/**
 * Asks Gemini how urgent the emergency sounds.
 * Returns { level, label }. Any failure returns level 'none', so an AI problem
 * never stops the SOS from being saved.
 */
async function triage(type, symptoms) {
    const result = { level: 'none', label: '' };
    if (!apiKey || (!symptoms && !type)) {
        return result; // no key, or nothing to analyse
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
You are an AI emergency triage assistant. Analyze the following patient situation:
Emergency Type: ${type || 'Not specified'}
Symptoms: ${symptoms || 'Not specified'}

Classify the priority level as exactly one of: high, medium, low.
Provide a short, urgent label (max 5-7 words) without quotes.
Return only a JSON object like this: {"level": "high", "label": "🔴 HIGH PRIORITY - Possible cardiac event"}
`;
        const response = await model.generateContent(prompt);
        const responseText = response.response.text();

        // The model may add text around the JSON: take the first {...} block
        const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            result.level = parsed.level || 'medium';
            result.label = parsed.label || 'Evaluating priority...';
        }
    } catch (err) {
        console.error("Gemini API Error:", err);
    }
    return result;
}

// ─────────────────────────────────────────────
// 🚑 Create SOS Request  →  status: "pending"
// ─────────────────────────────────────────────
const createSOS = async (req, res) => {
    try {
        const { patientName, location, symptoms, type } = req.body;

        const triageInfo = await triage(type, symptoms);

        const request = new Request({
            patientName,
            location,
            symptoms,
            emergencyType: type,
            triageInfo: {
                level: triageInfo.level,
                label: triageInfo.label
            },
            status: "pending"   // explicit, matches default
        });

        await request.save();

        // Push the new SOS to every open doctor/admin dashboard immediately (Socket.io)
        global.io.emit('requestUpdate', request);

        res.status(201).json(request);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// ✅ Accept Request  →  status: "accepted"
//    Assigns the geographically nearest available ambulance
// ─────────────────────────────────────────────
const acceptRequest = async (req, res) => {
    try {
        const { doctorId } = req.body;

        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const availableAmbulances = await Ambulance.find({ status: 'available' });
        if (availableAmbulances.length === 0) {
            return res.status(400).json({ message: 'No ambulance available' });
        }

        // The closest free ambulance to the patient (see utils/distance.js)
        const nearestAmbulance = findNearest(request.location, availableAmbulances);

        nearestAmbulance.status = 'busy';
        await nearestAmbulance.save();

        request.status = 'accepted';
        request.doctor = doctorId;
        request.ambulance = nearestAmbulance._id;
        request.ambulanceLocation = nearestAmbulance.location;
        await request.save();

        global.io.emit('requestUpdate', request);
        res.json(request);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ─────────────────────────────────────────────
// 📋 Get all Requests (with the doctor's details filled in)
// ─────────────────────────────────────────────
const getRequests = async (req, res) => {
    try {
        const requests = await Request.find().populate('doctor');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────
// 📍 Get single Request by ID
// ─────────────────────────────────────────────
const getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Shared by the doctor and the ambulance location endpoints.
 * Saves the new position in `field` ('doctorLocation' or 'ambulanceLocation'),
 * moves an "accepted" request to "on_the_way" on its first ping,
 * and pushes the update to every open screen.
 */
async function saveLocation(req, res, field) {
    try {
        const { lat, lng } = req.body;

        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request[field] = { lat, lng };

        // Auto-advance: accepted → on_the_way on first movement
        if (request.status === "accepted") {
            request.status = "on_the_way";
        }

        await request.save();

        // 🔥 Emit both location + new status
        global.io.emit("locationUpdate", request);

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ─────────────────────────────────────────────
// 🗺️ Update Doctor Location
// ─────────────────────────────────────────────
const updateDoctorLocation = async (req, res) => {
    return saveLocation(req, res, 'doctorLocation');
};

// ─────────────────────────────────────────────
// 🚑 Update Ambulance Location
// ─────────────────────────────────────────────
const updateAmbulanceLocation = async (req, res) => {
    return saveLocation(req, res, 'ambulanceLocation');
};

// ─────────────────────────────────────────────
// 📌 Update Request Status (arrived / completed)
// ─────────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status;
        await request.save();

        // Free the ambulance when the job is done, so it can be sent to the next SOS
        if (status === "completed" && request.ambulance) {
            await Ambulance.findByIdAndUpdate(request.ambulance, { status: "available" });
        }

        // 🔥 Broadcast status change
        global.io.emit("requestUpdate", request);

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSOS,
    acceptRequest,
    getRequests,
    getRequestById,
    updateDoctorLocation,
    updateAmbulanceLocation,
    updateStatus
};
