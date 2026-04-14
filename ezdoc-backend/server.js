const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const requestRoutes = require('./routes/requestRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// 🔥 SOCKET IMPORTS
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', requestRoutes);
app.use('/api', doctorRoutes);
app.use('/api', appointmentRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: '🚑 EZDoc Backend is running!' });
});

// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 ATTACH SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// 🔥 MAKE IO GLOBAL
global.io = io;

// 🔥 SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});