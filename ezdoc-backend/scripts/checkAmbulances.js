/**
 * Diagnostic script — shows every ambulance document in the DB
 * Run with: node scripts/checkAmbulances.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Ambulance = require('../models/ambulance');

async function check() {
    console.log('\n🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    const all = await Ambulance.find({});
    console.log(`📊 Total ambulances in DB: ${all.length}\n`);

    if (all.length === 0) {
        console.log('❌ No ambulances found! Run: node seed.js');
    } else {
        all.forEach((a, i) => {
            console.log(`Ambulance ${i + 1}:`);
            console.log(`  _id:           ${a._id}`);
            console.log(`  driverName:    ${a.driverName}`);
            console.log(`  vehicleNumber: ${a.vehicleNumber}`);
            console.log(`  status:        "${a.status}"  ← must be exactly "available"`);
            console.log(`  location:      lat=${a.location?.lat}, lng=${a.location?.lng}`);
            console.log();
        });

        const available = all.filter(a => a.status === 'available');
        const busy      = all.filter(a => a.status === 'busy');
        const other     = all.filter(a => a.status !== 'available' && a.status !== 'busy');

        console.log(`✅ available: ${available.length}`);
        console.log(`🔴 busy:      ${busy.length}`);
        if (other.length) {
            console.log(`⚠️  unknown status (these will NEVER be assigned!): ${other.length}`);
            other.forEach(a => console.log(`   → "${a.status}" — id: ${a._id}`));
        }
    }

    await mongoose.disconnect();
}

check().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
