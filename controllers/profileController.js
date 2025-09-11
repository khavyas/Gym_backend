import Profile from "../models/Profile.js";

// @desc Get user profile
// @route GET /api/profile/:id
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update profile (except fullName & email)
// @route PUT /api/profile/:id
export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Ensure immutable fields are not changed
    const { fullName, email, ...editableFields } = req.body;

    Object.assign(profile, editableFields);
    await profile.save();

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

