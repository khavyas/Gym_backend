import mongoose, { Schema, Types, InferSchemaType } from 'mongoose';

const wellnessAnswerSchema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true // For faster queries
    },
    answers: {
      type: Map,
      of: Schema.Types.Mixed, // Can store strings, arrays, numbers
      required: true
    },
    // Store metadata about completion
    completedAt: { type: Date, default: Date.now },
    userRole: {
      type: String,
      enum: ['user', 'consultant'],
      required: true
    }
  },
  { timestamps: true }
);

// Ensure one wellness answer per user
wellnessAnswerSchema.index({ userId: 1 }, { unique: true });

export type WellnessAnswerType = InferSchemaType<typeof wellnessAnswerSchema>;

export default mongoose.model<WellnessAnswerType>('WellnessAnswer', wellnessAnswerSchema);