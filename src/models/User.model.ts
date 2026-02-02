import mongoose, { Schema, Types, InferSchemaType, Document } from 'mongoose';

// Menstrual Cycle Sub-Schema
const menstrualCycleSchema = new Schema({
  isTracking: { type: Boolean, default: false },
  
  // Basic cycle information
  averageCycleLength: { type: Number, default: 28 },
  averagePeriodLength: { type: Number, default: 5 },
  
  // Last period information
  lastPeriodStartDate: { type: Date },
  lastPeriodEndDate: { type: Date },
  
  // Cycle history (last 12 cycles)
  cycleHistory: [{
    periodStartDate: { type: Date, required: true },
    periodEndDate: { type: Date },
    cycleLength: { type: Number },
    periodLength: { type: Number },
    symptoms: [{
      type: { 
        type: String, 
        enum: [
          'cramps', 'headache', 'bloating', 'mood_swings', 
          'fatigue', 'breast_tenderness', 'acne', 'back_pain',
          'nausea', 'food_cravings', 'insomnia', 'anxiety'
        ] 
      },
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      date: { type: Date }
    }],
    flowIntensity: [{
      date: { type: Date },
      intensity: { type: String, enum: ['light', 'medium', 'heavy'] }
    }],
    notes: { type: String }
  }],
  
  // Predictions
  nextPeriodDate: { type: Date },
  fertileWindowStart: { type: Date },
  fertileWindowEnd: { type: Date },
  ovulationDate: { type: Date },
  
  // Settings
  notifications: {
    periodReminder: { type: Boolean, default: true },
    fertileWindowReminder: { type: Boolean, default: false },
    daysBeforeReminder: { type: Number, default: 2 }
  },
  
  // Analytics
  cycleRegularity: { 
    type: String, 
    enum: ['regular', 'irregular', 'unknown'],
    default: 'unknown'
  },
  
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"], required: false },
    weight: { type: Number, required: false },
    dateOfBirth: { type: Date },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      }
    },
    otp: { type: String },
    otpAttempts: { type: Number, default: 0 },
    otpLastSent: { type: Date },
    aadharNumber: {
      type: String,
      minlength: 12,
      maxlength: 12,
      match: /^[0-9]{12}$/,
      required: false
    },
    abhaId: { type: String, required: false },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },
    
    // Menstrual Cycle Tracking (only for female users)
    menstrualCycle: {
      type: menstrualCycleSchema,
      default: null
    },
    
    consent: { type: Boolean, required: true },
    privacyNoticeAccepted: { type: Boolean, required: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    oauthProvider: {
      type: String,
      enum: ["google", "facebook", "apple"]
    },
    oauthId: { type: String },
    role: {
      type: String,
      enum: ['user', 'admin', 'consultant', 'superadmin'],
      default: 'user'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Validator: Check that at least one exists (email or phone)
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either email or phone is required');
    this.invalidate('phone', 'Either email or phone is required');
  }
  next();
});

export type UserType = InferSchemaType<typeof userSchema>;

// Export with proper typing
interface UserDocument extends Document, UserType {
  _id: Types.ObjectId;
}

export default mongoose.model<UserDocument>('User', userSchema);