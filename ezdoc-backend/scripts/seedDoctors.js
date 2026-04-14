/**
 * Seed Script — Insert sample doctors into MongoDB
 *
 * Usage:
 *   cd ezdoc-backend
 *   node scripts/seedDoctors.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/doctor');

dotenv.config();

const DOCTORS = [
    {
        name: 'Dr. Rahul Sharma',
        specialization: 'Cardiologist',
        experience: 12,
        location: 'Mumbai',
        phone: '9876543210',
        photo: '❤️',
        rating: 4.9,
        available: true,
        coordinates: { lat: 19.0760, lng: 72.8777 },
    },
    {
        name: 'Dr. Priya Mehta',
        specialization: 'General Physician',
        experience: 8,
        location: 'Mumbai',
        phone: '9876543211',
        photo: '🩺',
        rating: 4.7,
        available: true,
        coordinates: { lat: 19.0822, lng: 72.8808 },
    },
    {
        name: 'Dr. Arif Khan',
        specialization: 'Neurologist',
        experience: 15,
        location: 'Pune',
        phone: '9876543212',
        photo: '🧠',
        rating: 4.8,
        available: true,
        coordinates: { lat: 18.5204, lng: 73.8567 },
    },
    {
        name: 'Dr. Sneha Joshi',
        specialization: 'Dentist',
        experience: 6,
        location: 'Mumbai',
        phone: '9876543213',
        photo: '🦷',
        rating: 4.6,
        available: true,
        coordinates: { lat: 19.0896, lng: 72.8656 },
    },
    {
        name: 'Dr. Vikram Patel',
        specialization: 'Orthopedic',
        experience: 10,
        location: 'Navi Mumbai',
        phone: '9876543214',
        photo: '🦴',
        rating: 4.5,
        available: true,
        coordinates: { lat: 19.0330, lng: 73.0297 },
    },
    {
        name: 'Dr. Ananya Singh',
        specialization: 'Pediatrician',
        experience: 7,
        location: 'Mumbai',
        phone: '9876543215',
        photo: '👶',
        rating: 4.8,
        available: false, // busy — tests filtering
        coordinates: { lat: 19.1136, lng: 72.8697 },
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear old doctor records
        await Doctor.deleteMany({});
        console.log('🗑️  Cleared existing doctors');

        // Insert fresh doctors
        const inserted = await Doctor.insertMany(DOCTORS);
        console.log(`🌱 Inserted ${inserted.length} doctors:`);
        inserted.forEach(d =>
            console.log(`   ${d.photo}  ${d.name} — ${d.specialization} (${d.available ? '✅ available' : '❌ busy'})`)
        );

        console.log('\n🎉 Seed complete!');
        console.log('   Test: GET http://localhost:5000/api/doctors');
        console.log('   Should return 5 available doctors (Ananya is busy)\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
