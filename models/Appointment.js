// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who booked
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultant', required: true },

    title: { type: String },
    notes: { type: String },

    startAt: { type: Date, required: true },
    endAt: { type: Date },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'],
      default: 'pending',
    },

    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    price: { type: Number },

    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
    },

    location: { type: String },

    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
