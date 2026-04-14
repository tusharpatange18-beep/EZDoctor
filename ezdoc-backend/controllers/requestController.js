const Request = require('../models/Request');
const Ambulance = require('../models/ambulance');
const { findNearest } = require('../utils/distance');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Default API Key check (to not crash if missing)
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// ─────────────────────────────────────────────
// 🚑 Create SOS Request  →  status: "pending"
// ─────────────────────────────────────────────
const createSOS = async (req, res) => {
    try {
        const { patientName, location, symptoms, type } = req.body;

        let triageLevel = 'none';
        let triageLabel = '';

        if (apiKey && (symptoms || type)) {
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
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                // Extract json
                const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    triageLevel = parsed.level || 'medium';
                    triageLabel = parsed.label || 'Evaluating priority...';
                }
            } catch (err) {
                console.error("Gemini API Error:", err);
            }
        }

        const request = new Request({
            patientName,
            location,
            symptoms,
            emergencyType: type,
            triageInfo: {
                level: triageLevel,
                label: triageLabel
            },
            status: "pending"   // explicit, matches default
        });

        await request.save();

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
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const availableAmbulances = await Ambulance.find({ status: 'available' });
        if (!availableAmbulances.length) {
            return res.status(400).json({ message: 'No ambulance available' });
        }

        // Use utility to find nearest ambulance
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
// 📋 Get all Requests
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

// ─────────────────────────────────────────────
// 🗺️ Update Doctor/Ambulance Location
//    accepted → on_the_way on first location ping
// ─────────────────────────────────────────────
const updateDoctorLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.doctorLocation = { lat, lng };

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
};

// ─────────────────────────────────────────────
// 🚑 Update Ambulance Location
//    accepted → on_the_way on first ping
// ─────────────────────────────────────────────
const updateAmbulanceLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.ambulanceLocation = { lat, lng };

        // Auto-advance: accepted → on_the_way
        if (request.status === "accepted") {
            request.status = "on_the_way";
        }

        await request.save();

        // 🔥 Emit updated request with new status
        global.io.emit("locationUpdate", request);

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ─────────────────────────────────────────────
// 📌 Update Request Status (arrived / completed)
// ─────────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "accepted", "on_the_way", "arrived", "completed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status;
        await request.save();

        // Free ambulance when completed
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