require('dotenv').config();
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const waterRoutes = require("./routes/waterRoutes");
const consultantRoutes = require("./routes/consultantRoutes");
const profileRoutes = require("./routes/profileRoutes");
const cors = require("cors");
const gymRoutes = require('./routes/gymRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Detailed logging middleware
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================\n');
  next();
});

// Routes - AUTH FIRST
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/gyms', gymRoutes);

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error caught:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));