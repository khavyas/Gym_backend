import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import eventRoutes from "./routes/eventRoutes";
import waterRoutes from "./routes/waterRoutes";
import consultantRoutes from "./routes/consultantRoutes";
import profileRoutes from "./routes/profileRoutes";
import cors from "cors";
import gymRoutes from './routes/gymRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import mealRoutes from './routes/mealRoutes';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import authRoutes from './routes/authRoutes';
import metricsRoutes from './routes/metricsRoutes';
import UserModel from "./models/User.model";
import mongoose from "mongoose";
import workoutRoutes from './routes/workoutRoutes';
import wellnessRoutes from './routes/wellnessRoutes';
import menstrualCycleRoutes from './routes/menstrualCycleRoutes';
import checkInRoutes from './routes/checkInRoutes';
import seedCheckInQuestions from "./seeds/seedCheckInQuestions";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Detailed logging middleware
// log every request
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('========================\n');
  next();
});

// add 2secs latency
app.use((req, res, next) => {
  setTimeout(() => next(), 2000);
});

// Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/menstrual-cycle', menstrualCycleRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/menstrual-cycle', menstrualCycleRoutes);

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

const insertDummyData = async () => {
  try {
    seedCheckInQuestions();
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  // insertDummyData();
  console.log(`Server running on port ${PORT}`);
});