const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    instructor: { type: String },
    cost: { type: Number, default: 0 },
    benefits: [{ type: String }],
    date: { type: Date, required: true },
    location: { type: String, required: true },

    // Reference to GymCenter
    gymCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GymCenter',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
