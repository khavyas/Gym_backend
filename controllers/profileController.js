import Profile from "../models/Profile.js";

// @desc Get user profile by userId
// @route GET /api/profile/:userId
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update profile by userId (only editable fields)
// @route PUT /api/profile/:userId
export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Prevent updating immutable fields
    const { fullName, email, userId, ...editableFields } = req.body;

    Object.assign(profile, editableFields);
    await profile.save();

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
