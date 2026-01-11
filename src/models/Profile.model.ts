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
      // REMOVED immutable: true to allow sync from User table
    },
    email: {
      type: String,
      required: false,
      // REMOVED unique and immutable to allow flexibility
    },
    phone: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    dateOfBirth: { type: String },
    aadharNumber: { 
      type: String, 
      // minlength: 12, 
      // maxlength: 12, 
      // match: /^[0-9]{12}$/
      default: ''
    },
    abhaId: { type: String },

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
        minlength: function() {
          return this.address?.pincode && this.address.pincode.length > 0 ? 6 : 0;
        },
        maxlength: 6 
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

// Remove the pre-validate hook that requires email or phone
// The User model already handles this validation

export default mongoose.model("Profile", profileSchema);