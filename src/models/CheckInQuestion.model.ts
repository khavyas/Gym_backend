import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckInQuestion extends Document {
  field: string;
  label: string;
  type: 'scale' | 'number' | 'yesno' | 'dropdown';
  domainId: string;
  domainLabel: string;
  domainIcon: string;
  domainColor: string;
  domainGradientColors: [string, string];
  min?: number;
  max?: number;
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
      enum: ['scale', 'number', 'yesno', 'dropdown'],
      required: true,
    },
    domainId:    { type: String, required: true },
    domainLabel: { type: String, required: true },
    domainIcon:  { type: String, required: true },
    domainColor: { type: String, required: true },
    domainGradientColors: { type: [String], required: true },
    min:          { type: Number },
    max:          { type: Number },
    unit:         { type: String },
    lowLabel:     { type: String },
    highLabel:    { type: String },
    options:      { type: [String], default: undefined },
    optional:     { type: Boolean, default: false },
    invertedScore:{ type: Boolean, default: false },
    order:        { type: Number, required: true },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

CheckInQuestionSchema.index({ domainId: 1, order: 1 });

export default mongoose.model<ICheckInQuestion>('CheckInQuestion', CheckInQuestionSchema);