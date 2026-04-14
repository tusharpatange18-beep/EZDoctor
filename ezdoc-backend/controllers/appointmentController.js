const Appointment = require('../models/Appointment');
const Doctor = require('../models/doctor');

// ─────────────────────────────────────────────────────────
// POST /api/appointments
// Body: { doctorId, date, time, notes? }
// Auth: Bearer token required (patientId from req.user)
// ─────────────────────────────────────────────────────────
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, notes } = req.body;

        // Validate required fields
        if (!doctorId || !date || !time) {
            return res.status(400).json({ message: 'doctorId, date, and time are required' });
        }

        // Verify doctor exists and is available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        if (!doctor.available) {
            return res.status(400).json({ message: 'Doctor is not available' });
        }

        // Create appointment — patientId comes from the JWT via protect middleware
        const patientId = req.user._id; // 🔥 FIX
        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date,
            time,
            notes: notes || '',
            status: 'booked',
        });

        // Populate doctor details for the response
        await appointment.populate('doctorId', 'name specialization location phone');

        res.status(201).json({
            message: '✅ Appointment booked successfully',
            appointment,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// GET /api/appointments/my
// Returns all appointments for the logged-in patient
// ─────────────────────────────────────────────────────────
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment
            .find({ patientId: req.user._id })
            .populate('doctorId', 'name specialization location photo rating')
            .sort({ createdAt: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────
// PATCH /api/appointments/:id/cancel
// Patient cancels their own appointment
// ─────────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user._id,   // ensure patient owns this appointment
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.status === 'cancelled') {
            return res.status(400).json({ message: 'Already cancelled' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled', appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAppointment, getMyAppointments, cancelAppointment };
