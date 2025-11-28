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

dotenv.config();
connectDB();

const app = express();

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

// Middleware
app.use(express.json());
app.use(cors());

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
    UserModel.insertMany([
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Rohan Mehta",
        age: 38,
        gender: "male",
        dateOfBirth: new Date("1987-04-12"),
        phone: "9876543201",
        email: "rohan.mehta@example.com",
        password: "$2b$10$abc123hashforpassword",
        otp: null,
        otpAttempts: 0,
        otpLastSent: null,
        aadharNumber: "123456789012",
        abhaId: "ABHA-00123",
        address: {
          street: "12 MG Road",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001"
        },
        consent: true,
        privacyNoticeAccepted: true,
        emailVerified: true,
        phoneVerified: true,
        oauthProvider: null,
        oauthId: null,
        role: "consultant",
        createdBy: null,
        lastModifiedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Priya Sinha",
        age: 34,
        gender: "female",
        dateOfBirth: new Date("1991-02-21"),
        phone: "9876543202",
        email: "priya.sinha@example.com",
        password: "$2b$10$abc123hashforpassword",
        otp: null,
        otpAttempts: 0,
        otpLastSent: null,
        aadharNumber: "234567890123",
        abhaId: "ABHA-00124",
        address: {
          street: "45 Park Avenue",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001"
        },
        consent: true,
        privacyNoticeAccepted: true,
        emailVerified: true,
        phoneVerified: false,
        oauthProvider: null,
        oauthId: null,
        role: "consultant",
        createdBy: null,
        lastModifiedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Arjun Das",
        age: 41,
        gender: "male",
        dateOfBirth: new Date("1984-09-18"),
        phone: "9876543203",
        email: "arjun.das@example.com",
        password: "$2b$10$abc123hashforpassword",
        otp: null,
        otpAttempts: 0,
        otpLastSent: null,
        aadharNumber: "345678901234",
        abhaId: "ABHA-00125",
        address: {
          street: "8 Lake View Road",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700029"
        },
        consent: true,
        privacyNoticeAccepted: true,
        emailVerified: false,
        phoneVerified: true,
        oauthProvider: null,
        oauthId: null,
        role: "consultant",
        createdBy: null,
        lastModifiedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Neha Kapoor",
        age: 36,
        gender: "female",
        dateOfBirth: new Date("1989-07-05"),
        phone: "9876543204",
        email: "neha.kapoor@example.com",
        password: "$2b$10$abc123hashforpassword",
        otp: null,
        otpAttempts: 0,
        otpLastSent: null,
        aadharNumber: "456789012345",
        abhaId: "ABHA-00126",
        address: {
          street: "22 Residency Lane",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001"
        },
        consent: true,
        privacyNoticeAccepted: true,
        emailVerified: true,
        phoneVerified: true,
        oauthProvider: "google",
        oauthId: "google-oauth-12345",
        role: "consultant",
        createdBy: null,
        lastModifiedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Dr. Vikram Rao",
        age: 45,
        gender: "male",
        dateOfBirth: new Date("1980-01-23"),
        phone: "9876543205",
        email: "vikram.rao@example.com",
        password: "$2b$10$abc123hashforpassword",
        otp: null,
        otpAttempts: 0,
        otpLastSent: null,
        aadharNumber: "567890123456",
        abhaId: "ABHA-00127",
        address: {
          street: "5 Nehru Nagar",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500001"
        },
        consent: true,
        privacyNoticeAccepted: true,
        emailVerified: true,
        phoneVerified: false,
        oauthProvider: "facebook",
        oauthId: "fb-oauth-98765",
        role: "consultant",
        createdBy: null,
        lastModifiedBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    );
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  // insertDummyData();
  console.log(`Server running on port ${PORT}`);
});