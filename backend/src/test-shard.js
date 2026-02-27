require('dotenv').config();
const mongoose = require('mongoose');

const shard = 'clusternassim-shard-00-00.redqx.mongodb.net:27017';
const user = 'admin';
const pass = 'Cinema2026_SecurePass';
const db = 'cinema';

// Standard URI format (no SRV)
const uri = `mongodb://${user}:${pass}@${shard}/${db}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

console.log('--- Test Connexion Directe Shard ---');
console.log('URI:', uri.replace(/:([^@]+)@/, ':****@'));

async function test() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connecté au Shard !');
        console.log('ReplicaSet:', mongoose.connection.db.databaseName); // Wait, this is DB name
        // Get replica set name from the connection
        const admin = mongoose.connection.db.admin();
        const info = await admin.command({ isMaster: 1 });
        console.log('ReplicaSet Name:', info.setName);
        process.exit(0);
    } catch (err) {
        console.error('❌ Échec Shard:', err.message);
        process.exit(1);
    }
}
test();
