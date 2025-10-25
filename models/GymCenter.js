const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); 

const gymCenterSchema = mongoose.Schema(
  {
    gymId: {
      type: String,
      unique: true,
      default: () => `GYM-${uuidv4()}`, 
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    // Example filter fields, adjust as needed:
    amenities: [String],
    price: Number,
    rating: Number
  },
  { timestamps: true }
);

// Add 2dsphere index for geospatial search
gymCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('GymCenter', gymCenterSchema);
