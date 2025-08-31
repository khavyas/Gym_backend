const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Hardcoded MongoDB URI as fallback
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://khavyasakthi1_db_user:8bvkjKiejsSDerzv@cluster0.rjvoxei.mongodb.net/gym_app?retryWrites=true&w=majority&appName=Cluster0";
    
    console.log('Using MongoDB URI:', mongoUri.startsWith('mongodb') ? 'Valid URI found' : 'Invalid URI');
    
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
