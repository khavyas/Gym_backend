import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',   // Reference to User table
      required: true,
    },
    workoutType: {
      type: String,
      required: true,
      enum: ['Cardio', 'Strength', 'Yoga', 'HIIT'],
    },
    duration: {
      type: Number,  // in minutes
      required: true,
      min: 1,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },
    intensity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Index for faster queries by user and date
workoutSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Workout', workoutSchema);