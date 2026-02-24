const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB unavailable: ${error.message}`);
    console.error('   → Server will start but DB operations will fail.');
    console.error('   → Start MongoDB or run: docker-compose up mongo');
    // Don't exit — allow server to start without DB
  }
};

module.exports = connectDB;
