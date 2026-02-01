import mongoose, { Schema, Document } from 'mongoose';

export interface IWellnessResponse extends Document {
  userId: mongoose.Types.ObjectId | string; // references your User model
  userRole: string;                          // 'user' | 'consultant' | 'admin' | 'superadmin'
  questionId: number;                        // matches WellnessQuestion.questionId
  answer: string | string[];                 // string for scale/text/single-select, string[] for multi-select
  submittedAt: Date;
}

const WellnessResponseSchema = new Schema<IWellnessResponse>(
  {
    userId: {
      type: Schema.Types.Mixed, // ObjectId or string — matches however your User model stores IDs
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ['user', 'consultant', 'admin', 'superadmin'],
    },
    questionId: {
      type: Number,
      required: true,
    },
    answer: {
      type: Schema.Types.Mixed, // string or string[] — flexible
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Key indexes:
// 1) Fetch all responses for a given user quickly
// 2) Unique constraint: one response per user per question (upsert on re-submit)
WellnessResponseSchema.index({ userId: 1, questionId: 1 }, { unique: true });
WellnessResponseSchema.index({ userId: 1 });

export default mongoose.model<IWellnessResponse>('WellnessResponse', WellnessResponseSchema);