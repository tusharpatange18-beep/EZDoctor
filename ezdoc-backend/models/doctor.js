const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    specialization: {
        type: String,
        required: true,
        trim: true,
        // examples: 'Cardiologist', 'Dentist', 'General Physician', 'Neurologist'
    },
    experience: {
        type: Number,   // years of experience
        default: 1,
        min: 0,
    },
    location: {
        type: String,
        trim: true,
        default: 'Mumbai',
    },
    phone: {
        type: String,
        trim: true,
    },
    photo: {
        type: String,   // URL or emoji avatar fallback
        default: '🩺',
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 4.5,
    },
    available: {
        type: Boolean,
        default: true,
    },
    // Geo-coordinates for nearest-doctor matching
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);