require('dotenv').config();
const mongoose = require('mongoose');

console.log('--- Diagnostic MongoDB Atlas (Inside src) ---');
const uri = process.env.MONGO_URI;
console.log('URI used:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED');

async function test() {
    if (!uri) {
        console.error('❌ MONGO_URI est indéfini dans .env');
        process.exit(1);
    }
    try {
        console.log('Tentative de connexion...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Succès ! Connecté à Atlas.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Échec de la connexion.');
        console.error('Nom erreur:', err.name);
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        if (err.reason) console.error('Raison:', err.reason);
        console.dir(err, { depth: null });
        process.exit(1);
    }
}

test();
