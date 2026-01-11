// models/Profile.model.ts
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    dateOfBirth: { type: String },
    aadharNumber: { 
      type: String,
      default: '',
      validate: {
        validator: function(v: string) {
          // Only validate if value is provided and not empty
          if (!v || v.length === 0) return true;
          return v.length === 12 && /^[0-9]{12}$/.test(v);
        },
        message: 'Aadhar number must be exactly 12 digits'
      }
    },
    abhaId: { 
      type: String,
      default: '',
      validate: {
        validator: function(v: string) {
          // Only validate if value is provided and not empty
          if (!v || v.length === 0) return true;
          // Add your ABHA ID validation logic here
          return v.length >= 14; // Example: ABHA is typically 14 digits
        },
        message: 'ABHA ID must be at least 14 characters'
      }
    },

    healthMetrics: {
      weight: String,
      height: String,
      age: String,
      gender: { type: String, enum: ["male", "female", "other"] },
      fitnessGoal: String,
    },

    workPreferences: {
      occupation: String,
      workoutTiming: String,
      availableDays: [String],
      workStressLevel: String,
      sedentaryHours: String,
      workoutLocation: String,
    },

    notifications: {
      workoutReminders: { type: Boolean, default: true },
      newContent: { type: Boolean, default: true },
      promotionOffers: { type: Boolean, default: false },
      appointmentReminders: { type: Boolean, default: true },
    },

    security: {
      biometricLogin: { type: Boolean, default: false },
      twoFactorAuth: { type: Boolean, default: false },
    },

    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { 
        type: String, 
        default: '',
        validate: {
          validator: function(v: string) {
            // Only validate if value is provided and not empty
            if (!v || v.length === 0) return true;
            return v.length === 6 && /^[0-9]{6}$/.test(v);
          },
          message: 'Pincode must be exactly 6 digits'
        }
      }
    },

    lastlogin: { type: Date },
    logincount: { type: Number, default: 0 },
    membershipStatus: { 
      type: String, 
      enum: ["active", "trial", "suspended"], 
      default: "trial" 
    },
    badgeCount: { type: Number, default: 0 },
    achievements: [String],
    referralCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);