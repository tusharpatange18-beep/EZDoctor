const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getMyAppointments,
    cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// All appointment routes require auth
router.post('/appointments',             protect, createAppointment);   // book
router.get('/appointments/my',           protect, getMyAppointments);   // patient history
router.patch('/appointments/:id/cancel', protect, cancelAppointment);   // cancel

module.exports = router;
