const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
    },
    date: {
        type: String,   // "YYYY-MM-DD"
        required: true,
    },
    time: {
        type: String,   // "10:00 AM"
        required: true,
    },
    status: {
        type: String,
        enum: ['booked', 'confirmed', 'cancelled', 'completed'],
        default: 'booked',
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
