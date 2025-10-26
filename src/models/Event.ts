const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    instructor: { type: String },
    cost: { type: Number, default: 0 },
    benefits: [{ type: String }],
    date: { type: Date, required: true },

    location: {
      type: String,
      required: function () {
        return this.eventType === 'offline' || this.eventType === 'hybrid';
      },
    },

    eventType: {
      type: String,
      enum: ['offline', 'online', 'hybrid'],
      default: 'offline',
    },

    onlineLink: {
      type: String,
      required: function () {
        return this.eventType === 'online' || this.eventType === 'hybrid';
      },
    },

    gymCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GymCenter',
      required: false,
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
