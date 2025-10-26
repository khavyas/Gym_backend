// controllers/profileController.js
import Profile from '../models/Profile';
import mongoose from 'mongoose';

// @desc Get user profile by _id
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(req.params.userId) });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: req.body },                             // apply updates
      { new: true, runValidators: true }              // return updated doc & validate
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};