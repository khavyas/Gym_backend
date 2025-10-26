// models/Profile.js
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
      immutable: true,
    },
    email: {
      type: String,
      unique: true,
      immutable: true,
    },
    phone: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    aadharNumber: { type: String, minlength: 12, maxlength: 12, match: /^[0-9]{12}$/ },
    abhaId: { type: String }, // Optional: For ABDM/NDHM Health ID

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
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },

    lastlogin: { type: Date },                    //for activity tracking
    logincount: { type: Number, default: 0 },     //Analytics
    membershipStatus: { type: String, enum: ["active", "trial", "suspended"], default: "active" }, //Membership management
    badgeCount: { type: Number, default: 0 }, //Gamification
    achievements: [String], //Gamification
    referralCode: { type: String, unique: true, sparse: true }, //Referral system
  },
  { timestamps: true }
);

// Custom validator to require either email or phone
profileSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone is required'));
  }
  next();
});

export default mongoose.model("Profile", profileSchema);
