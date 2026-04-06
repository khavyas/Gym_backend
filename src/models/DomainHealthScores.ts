import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserDocument } from './User.model';
import { IDomain } from './Domain.model';
import { ICheckInResponse } from './CheckInResponse.model';

interface IMetricMean {
  questionId: Types.ObjectId;
  averageValue: number;
}

interface IWeightedMetric {
  questionId: Types.ObjectId;
  weightedValue: number;
  weight: number;
}

export interface IDomainHealthScore extends Document {
  userId: Types.ObjectId | UserDocument;
  domain: Types.ObjectId | IDomain;
  windowType: '14_day';
  windowStart: Date;
  windowEnd: Date;
  dataPointCount: number;
  metricMeans: IMetricMean[];
  weightedMetrics: IWeightedMetric[];
  dhi: number;
  status: 'green' | 'yellow' | 'red';
  sourceResponseIds: Array<Types.ObjectId | ICheckInResponse>;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DomainHealthScoresSchema = new Schema<IDomainHealthScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
      index: true,
    },
    windowType: {
      type: String,
      enum: ['14_day'],
      required: true,
      default: '14_day',
    },
    windowStart: {
      type: Date,
      required: true,
    },
    windowEnd: {
      type: Date,
      required: true,
    },
    dataPointCount: {
      type: Number,
      required: true,
      default: 7,
    },
    metricMeans: {
      type: [
        {
          questionId: {
            type: Schema.Types.ObjectId,
            ref: 'CheckInQuestion',
            required: true,
          },
          averageValue: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    weightedMetrics: {
      type: [
        {
          questionId: {
            type: Schema.Types.ObjectId,
            ref: 'CheckInQuestion',
            required: true,
          },
          weightedValue: {
            type: Number,
            required: true,
          },
          weight: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    dhi: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['green', 'yellow', 'red'],
      required: true,
    },
    sourceResponseIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'CheckInResponse',
          required: true,
        },
      ],
      default: [],
    },
    calculatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

DomainHealthScoresSchema.index(
  { userId: 1, domain: 1, windowType: 1, windowStart: 1, windowEnd: 1 }
);

DomainHealthScoresSchema.index({ userId: 1, calculatedAt: -1 });

export default mongoose.model<IDomainHealthScore>(
  'DomainHealthScore',
  DomainHealthScoresSchema
);
