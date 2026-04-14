const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    location: {
        lat: Number,
        lng: Number
    },
    symptoms: {
        type: String,
        default: ""
    },
    emergencyType: {
        type: String,
        default: "Other"
    },
    triageInfo: {
        level: {
            type: String,
            enum: ['high', 'medium', 'low', 'none'],
            default: 'none'
        },
        label: {
            type: String,
            default: ''
        }
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "on_the_way", "arrived", "completed"],
        default: "pending"
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    doctorLocation: {
        lat: Number,
        lng: Number
    },
    ambulance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ambulance'
    },
    ambulanceLocation: {
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);