// models/Ambulance.js

const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema({
    driverName: String,
    vehicleNumber: String,
    location: {
        lat: Number,
        lng: Number,
    },
    status: {
        type: String,
        enum: ["available", "busy"],
        default: "available", // ← must be "available" or "busy"; NOT a boolean field
    },
});

module.exports = mongoose.model("Ambulance", ambulanceSchema);