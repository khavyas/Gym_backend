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

// log every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/gyms', gymRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
