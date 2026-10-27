/**
 * Starts the real EZDoctor backend (Express + Socket.io) against a throwaway
 * in-memory MongoDB, seeded with demo doctors and one ambulance.
 * Used by Playwright's webServer, so E2E tests exercise the full stack.
 */
const { MongoMemoryServer } = require('mongodb-memory-server-core');

const PORT = process.env.E2E_API_PORT || 5055;

(async () => {
    const mongo = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongo.getUri('ezdoc-e2e');
    process.env.PORT = String(PORT);
    process.env.JWT_SECRET = 'e2e-secret';
    process.env.GEMINI_API_KEY = ''; // AI triage is skipped without a key

    require('../ezdoc-backend/server.js');

    const mongoose = require('../ezdoc-backend/node_modules/mongoose');
    await mongoose.connection.asPromise();
    const Doctor = require('../ezdoc-backend/models/doctor');
    const Ambulance = require('../ezdoc-backend/models/ambulance');

    await Doctor.insertMany([
        { name: 'Dr. Rahul Sharma', specialization: 'Cardiologist', experience: 12, location: 'Mumbai', phone: '9876543210', rating: 4.9, available: true },
        { name: 'Dr. Priya Desai', specialization: 'Pediatrician', experience: 8, location: 'Pune', phone: '9876543211', rating: 4.7, available: true },
        { name: 'Dr. Amit Kulkarni', specialization: 'General Physician', experience: 15, location: 'Nashik', phone: '9876543212', rating: 4.6, available: true },
    ]);
    await Ambulance.create({ driverName: 'Suresh', vehicleNumber: 'MH-01-AB-1234', location: { lat: 19.07, lng: 72.88 }, status: 'available' });
    console.log(`E2E backend ready on http://localhost:${PORT}`);

    const stop = async () => { await mongoose.disconnect(); await mongo.stop(); process.exit(0); };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
})().catch((err) => { console.error(err); process.exit(1); });
