// controllers/profileController.js
import Profile from '../models/Profile.model';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/request-response.dto';
import { CreateProfileDTO } from '../types/profile.dto';
import { Response } from 'express';
import User from '../models/User.model';

// @desc Create user profile
// POST /api/profile
export const createProfile = async (req: AuthRequest<CreateProfileDTO>, res: Response) => {
  try {
    const { email, ...profileData } = req.body;

    // Find user by email or use req.user
    const user = req.user.role === 'user' ? req.user : await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile already exists for this user
    const existingProfile = await Profile.findOne({ userId: user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists for this user"
      });
    }

    // Create new profile
    const profile = new Profile({
      userId: user._id,
      ...profileData
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
// POST /api/profile/update
export const updateProfile = async (req, res) => {
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
