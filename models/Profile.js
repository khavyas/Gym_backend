import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, 
    },
  fullName: {
    type: String,
    required: true,
    immutable: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
  phone: { type: String },
  bio: { type: String },
  profileImage: { type: String },

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
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
