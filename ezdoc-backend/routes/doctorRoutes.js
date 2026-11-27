const express = require('express');
const router = express.Router();
const {
    getDoctors,
    addDoctor,
    getDoctorById,
    setAvailability,
} = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Changing the doctor list is for admins only (the seed scripts write to the database directly)
const adminOnly = [protect, requireRole('admin')];

// GET  /api/doctors              → list all available doctors (supports ?specialization & ?location)  public
// POST /api/doctor               → add a doctor                                                       admin
// GET  /api/doctor/:id           → get single doctor                                                  public
// PATCH /api/doctor/:id/availability → set available true/false                                       admin

router.get('/doctors', getDoctors);
router.post('/doctor', adminOnly, addDoctor);
router.get('/doctor/:id', getDoctorById);
router.patch('/doctor/:id/availability', adminOnly, setAvailability);

module.exports = router;