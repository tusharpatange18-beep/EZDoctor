const Doctor = require('../models/doctor');

// ─────────────────────────────────────────────────────────
// GET /api/doctors
// Returns all available doctors
// Optional query params:
//   ?specialization=Dentist  → filter by specialization
//   ?location=Mumbai          → filter by location
// ─────────────────────────────────────────────────────────
const getDoctors = async (req, res) => {
    try {
        const query = { available: true };

        // Optional filters from query string
        if (req.query.specialization) {
            query.specialization = { $regex: req.query.specialization, $options: 'i' };
        }
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }

        const doctors = await Doctor.find(query).sort({ rating: -1, experience: -1 });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// POST /api/doctor
// Add a single doctor (for admin seeding / testing)
// ─────────────────────────────────────────────────────────
const addDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.create(req.body);
        res.status(201).json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/doctor/:id
// Get a single doctor by ID
// ─────────────────────────────────────────────────────────
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// PATCH /api/doctor/:id/availability
// Toggle doctor availability (available: true/false)
// ─────────────────────────────────────────────────────────
const setAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { available: req.body.available },
            { new: true }
        );
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDoctors, addDoctor, getDoctorById, setAvailability };
