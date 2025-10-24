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

// log every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
