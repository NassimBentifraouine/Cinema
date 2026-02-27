require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

console.log('--- Diagnostic MongoDB Atlas ---');
console.log('URI used:', process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@')); // Hide password

async function test() {
    try {
        console.log('Tentative de connexion...');
        await mongoose.connect(process.env.MONGO_URI, {
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
