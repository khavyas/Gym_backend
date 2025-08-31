const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Debug logging
    console.log('Environment check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('MONGO_URI value:', process.env.MONGO_URI);
    console.log('MONGO_URI type:', typeof process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined in environment variables");
    }
    
    // Check if the URI starts with the right scheme
    if (!process.env.MONGO_URI.startsWith('mongodb://') && !process.env.MONGO_URI.startsWith('mongodb+srv://')) {
      throw new Error(`Invalid MongoDB URI scheme. Got: ${process.env.MONGO_URI.substring(0, 20)}...`);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
