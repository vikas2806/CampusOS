const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

async function connectDB() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set — skipping DB connection (set it in .env)');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = connectDB;
