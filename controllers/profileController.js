// controllers/profileController.js
const Profile = require("../models/Profile");
const mongoose = require("mongoose");

// @desc Get user profile by _id
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(req.params.userId) });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) }, // ✅ cast to ObjectId
      { $set: req.body },                             // apply updates
      { new: true, runValidators: true }              // return updated doc & validate
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
