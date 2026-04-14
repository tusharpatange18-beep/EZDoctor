/**
 * 🌱 EZDoc Demo Seed Script
 * Creates demo users and ambulances for interview demos
 *
 * Run with: node seed.js
 * (from inside ezdoc-backend/ directory)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

// ── Models (inline to avoid import issues)
const userSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String, role: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const ambulanceSchema = new mongoose.Schema({
    driverName: String, vehicleNumber: String,
    location: { lat: Number, lng: Number },
    status: { type: String, default: 'available' }
});
const Ambulance = mongoose.model('Ambulance', ambulanceSchema);

async function seed() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    // ── Create demo users
    const salt = await bcrypt.genSalt(10);

    const demoUsers = [
        { name: 'Demo Patient', email: 'patient@demo.com', password: await bcrypt.hash('demo123', salt), role: 'patient' },
        { name: 'Dr. Smith',    email: 'doctor@demo.com',  password: await bcrypt.hash('demo123', salt), role: 'doctor' },
        { name: 'Admin User',   email: 'admin@demo.com',   password: await bcrypt.hash('demo123', salt), role: 'admin' },
    ];

    for (const u of demoUsers) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
            await User.create(u);
            console.log(`✅ Created user: ${u.email} (${u.role})`);
        } else {
            console.log(`⚠️  User already exists: ${u.email}`);
        }
    }

    // ── Create demo ambulances (Mumbai area)
    const ambulances = [
        { driverName: 'Raj Kumar',   vehicleNumber: 'MH-01-AA-1234', location: { lat: 19.0760, lng: 72.8777 }, status: 'available' },
        { driverName: 'Priya Nair',  vehicleNumber: 'MH-02-BB-5678', location: { lat: 19.0850, lng: 72.8650 }, status: 'available' },
        { driverName: 'Amit Singh',  vehicleNumber: 'MH-03-CC-9012', location: { lat: 19.0600, lng: 72.8900 }, status: 'available' },
    ];

    const existingCount = await Ambulance.countDocuments();
    if (existingCount === 0) {
        await Ambulance.insertMany(ambulances);
        console.log('✅ Created 3 demo ambulances');
    } else {
        console.log(`⚠️  ${existingCount} ambulances already exist — skipping`);
    }

    console.log('\n🎉 Seed complete!\n');
    console.log('Demo credentials:');
    console.log('  Patient: patient@demo.com / demo123');
    console.log('  Doctor:  doctor@demo.com  / demo123');
    console.log('  Admin:   admin@demo.com   / demo123\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
