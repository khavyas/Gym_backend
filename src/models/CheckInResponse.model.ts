import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICheckInResponse extends Document {
  userId: Types.ObjectId;
  answers: Map<string, string | number | string[]>;
  submittedAt: Date;
  updatedAt: Date;
}

const CheckInResponseSchema = new Schema<ICheckInResponse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,   // one response doc per user, upserted each time
      index: true,
    },
    answers: {
      type: Map,
      of: Schema.Types.Mixed,  // handles number, string, string[], yesno
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICheckInResponse>('CheckInResponse', CheckInResponseSchema);