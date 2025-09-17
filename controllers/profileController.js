// controllers/profileController.js
const Profile = require("../models/Profile");

// @desc Get user profile by _id
// @route GET /api/profile/:id
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id); // use _id directly
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update profile by _id
// @route PUT /api/profile/:id
const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Prevent updating immutable fields
    const { fullName, email, _id, ...editableFields } = req.body;

    Object.assign(profile, editableFields);
    await profile.save();

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
