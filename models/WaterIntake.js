const mongoose = require('mongoose');

const waterIntakeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',   // Reference to User table
      required: true,
    },
    amount: {
      type: Number,  // e.g., ml of water
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,  // when the water was logged
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);
