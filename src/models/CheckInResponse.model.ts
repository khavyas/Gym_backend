import mongoose, { Schema, Document, Types } from 'mongoose';

interface IAnswer {
  questionId: Types.ObjectId;
  value: number | string; // handles number, yesno (as string), dropdown (as string), and multiple options (as string[])
}

export interface ICheckInResponse extends Document {
  userId: Types.ObjectId;
  answers: IAnswer[];
  submittedAt: Date;
  updatedAt: Date;
}

const CheckInResponseSchema = new Schema<ICheckInResponse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answers: {
      type: [
        {
          questionId: { type: Schema.Types.ObjectId, ref: 'CheckInQuestion', required: true },
          value: { type: Schema.Types.Mixed, required: true }, // can be number or string based on question type
        }
      ],
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