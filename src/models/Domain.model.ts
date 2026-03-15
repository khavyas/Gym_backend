import mongoose, { Schema, Document } from 'mongoose';

export interface IDomain extends Document {
  domainId: string;
  domainLabel: string;
  domainIcon: string;
  domainColor: string;
  domainGradientColors: [string, string];
}

const DomainSchema = new Schema<IDomain>(
  {
    domainId: { type: String, required: true, unique: true, trim: true },
    domainLabel: { type: String, required: true, trim: true },
    domainIcon: { type: String, required: true, trim: true },
    domainColor: { type: String, required: true, trim: true },
    domainGradientColors: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDomain>('Domain', DomainSchema);
