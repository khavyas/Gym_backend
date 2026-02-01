import mongoose, { Schema, Document } from 'mongoose';

export interface IWellnessQuestion extends Document {
  questionId: number;              // stable numeric ID (matches what frontend sends back)
  question: string;                // the question text
  type: 'scale' | 'multiple-choice' | 'text';
  options?: string[];              // only for multiple-choice
  multiSelect?: boolean;           // true = checkboxes, false/absent = radio
  placeholder?: string;            // only for text type
  order: number;                   // display order
  isActive: boolean;               // soft-toggle without deleting
}

const WellnessQuestionSchema = new Schema<IWellnessQuestion>(
  {
    questionId: {
      type: Number,
      required: true,
      unique: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['scale', 'multiple-choice', 'text'],
      required: true,
    },
    options: {
      type: [String],
      default: undefined, // don't store empty array for non-MC questions
    },
    multiSelect: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: undefined,
    },
    order: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound index: fast lookup by order for rendering, and unique on questionId
WellnessQuestionSchema.index({ order: 1 });

export default mongoose.model<IWellnessQuestion>('WellnessQuestion', WellnessQuestionSchema);