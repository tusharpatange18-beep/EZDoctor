/**
 * Fix ambulance schema mismatch:
 *   Wrong:   { available: true }  (boolean)
 *   Correct: { status: "available" }  (string — matches the query in requestController)
 *
 * Run with: node scripts/fixAmbulances.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function fix() {
    console.log('\n🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected!\n');

    const all = await db.collection('ambulances').find({}).toArray();
    console.log(`📊 Found ${all.length} ambulance documents\n`);

    let fixed = 0;

    for (const doc of all) {
        const needsFix = doc.status === undefined || doc.status === null;

        if (needsFix) {
            // Migrate: available=true  → status="available"
            //          available=false → status="busy"
            const newStatus = doc.available === true ? 'available' : 'busy';

            await db.collection('ambulances').updateOne(
                { _id: doc._id },
                {
                    $set:   { status: newStatus },
                    $unset: { available: '' },   // remove the old boolean field
                }
            );

            console.log(`✅ Fixed: ${doc.driverName || doc._id}  →  status="${newStatus}"`);
            fixed++;
        } else if (doc.status === 'busy') {
            // Reset stale busy ambulances back to available so they can be assigned
            await db.collection('ambulances').updateOne(
                { _id: doc._id },
                { $set: { status: 'available' } }
            );
            console.log(`🔄 Reset busy → available: ${doc.driverName || doc._id}`);
            fixed++;
        } else {
            console.log(`ℹ️  OK (no change): ${doc.driverName || doc._id}  status="${doc.status}"`);
        }
    }

    console.log(`\n📝 ${fixed} documents updated`);

    // Final check
    const available = await db.collection('ambulances').countDocuments({ status: 'available' });
    const busy      = await db.collection('ambulances').countDocuments({ status: 'busy' });
    console.log(`\n✅ After fix → available: ${available}  |  busy: ${busy}\n`);

    await mongoose.disconnect();
    console.log('🎉 Done! Try accepting an SOS request now.\n');
}

fix().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
