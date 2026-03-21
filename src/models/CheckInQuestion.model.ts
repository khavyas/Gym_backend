import mongoose, { Schema, Document } from 'mongoose';

export interface IThreshold {
  min_value: number;
  max_value: number;
  label: "red" | "yellow" | "green";
}

export interface ICheckInQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  field: string;
  label: string;
  type: 'scale' | 'number' | 'dropdown';
  target: 'coordinator' | 'user';
  domain: mongoose.Types.ObjectId;
  weight: number;
  min?: number;
  max?: number;
  threshold?: IThreshold[];
  unit?: string;
  lowLabel?: string;
  highLabel?: string;
  options?: string[];
  optional?: boolean;
  invertedScore?: boolean;
  order: number;
  isActive: boolean;
}

const CheckInQuestionSchema = new Schema<ICheckInQuestion>(
  {
    field: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['scale', 'number', 'dropdown'],
      required: true,
    },
    target: {
      type: String,
      enum: ['coordinator', 'user'],
      required: true,
    },
    domain: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
    weight: { type: Number, default: 1 },
    min: { type: Number },
    max: { type: Number },
    threshold: {
      type: [{
        min_value: { type: Number, required: true },
        max_value: { type: Number, required: true },
        label: {
          type: String,
          enum: ['red', 'yellow', 'green'],
          required: true,
        },
      }],
    },
    unit: { type: String },
    lowLabel: { type: String },
    highLabel: { type: String },
    options: { type: [String], default: undefined },
    optional: { type: Boolean, default: false },
    invertedScore: { type: Boolean, default: false },
    order: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CheckInQuestionSchema.index({ domain: 1, order: 1 });

export default mongoose.model<ICheckInQuestion>('CheckInQuestion', CheckInQuestionSchema);
