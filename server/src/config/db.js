const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

async function connectDB() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set — skipping DB connection');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
