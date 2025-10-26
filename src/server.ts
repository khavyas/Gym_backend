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
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import authRoutes from './routes/authRoutes'

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

// Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
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
