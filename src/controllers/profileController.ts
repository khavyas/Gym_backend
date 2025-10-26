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
// POST /api/profile/update
exports.updateProfile = async (req, res) => {
  // req.user.id from auth, req.body has profile data
  const { fullName, age, gender, address, aadharNumber, abhaId, ...rest } = req.body;

  let profile = await Profile.findOne({ userId: req.user.id });

  if (!profile) {
    // Create new profile
    profile = new Profile({ userId: req.user.id, ...req.body });
  } else {
    // Update existing profile
    Object.assign(profile, req.body);
  }

  await profile.save();
  res.json({ profile });
};
