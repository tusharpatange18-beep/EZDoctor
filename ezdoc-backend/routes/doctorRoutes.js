const express = require('express');
const router = express.Router();
const {
    getDoctors,
    addDoctor,
    getDoctorById,
    setAvailability,
} = require('../controllers/doctorcontroller');

// GET  /api/doctors              → list all available doctors (supports ?specialization & ?location)
// POST /api/doctor               → add a doctor (admin/seed)
// GET  /api/doctor/:id           → get single doctor
// PATCH /api/doctor/:id/availability → set available true/false

router.get('/doctors', getDoctors);
router.post('/doctor', addDoctor);
router.get('/doctor/:id', getDoctorById);
router.patch('/doctor/:id/availability', setAvailability);

module.exports = router;