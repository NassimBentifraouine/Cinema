const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  Échec de la connexion MongoDB Atlas :`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error('   → Vérifiez que votre IP est autorisée dans le dashboard Atlas.');
    console.error('   → Vérifiez votre connexion DNS.');
  }
};

module.exports = connectDB;
