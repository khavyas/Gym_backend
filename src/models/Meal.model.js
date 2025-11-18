import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
    servingSize: {
      type: Number,
      default: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
    sodium: {
      type: Number,
      default: 0,
    },
    cholesterol: {
      type: Number,
      default: 0,
    },
    saturatedFat: {
      type: Number,
      default: 0,
    },
    potassium: {
      type: Number,
      default: 0,
    },
    // Optional: store the image reference if needed
    imageId: {
      type: String,
    },
    // Optional: store additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
mealSchema.index({ user: 1, createdAt: -1 });
mealSchema.index({ user: 1, mealType: 1 });

export default mongoose.model('Meal', mealSchema);