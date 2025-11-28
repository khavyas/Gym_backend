// controllers/profileController.ts
import Profile from '../models/Profile.model';
import mongoose from 'mongoose';
import { AuthRequest } from '../types/request-response.dto';
import { CreateProfileDTO } from '../types/profile.dto';
import { Response, Request } from 'express';
import User from '../models/User.model';

// @desc Create user profile
// POST /api/profile
export const createProfile = async (req: AuthRequest<CreateProfileDTO>, res: Response) => {
  try {
    const { email, ...profileData } = req.body;

    // Create profile for user making the request or for specified email
    const user = req.user.role === 'user' ? req.user : await User.findOne({ email, role: 'user' });
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get user profile by userId
// GET /api/profile/:userId
export const getProfile = async (req: Request, res: Response) => {
  try {
    console.log("📥 Fetching profile for userId:", req.params.userId);
    
    const profile = await Profile.findOne({ 
      userId: req.params.userId
    });
    
    if (!profile) {
      console.log("❌ Profile not found for userId:", req.params.userId);
      return res.status(404).json({ 
        success: false,
        message: "Profile not found" 
      });
    }
    
    console.log("✅ Profile found:", profile._id);
    res.json(profile);
  } catch (error: any) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc Update user profile
// PUT /api/profile/:userId
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    console.log("📝 Updating profile for userId:", userId);
    console.log("📦 Update payload:", JSON.stringify(req.body, null, 2));

    // Validate Aadhar if provided
    if (req.body.aadharNumber && req.body.aadharNumber.length > 0) {
      if (req.body.aadharNumber.length !== 12) {
        return res.status(400).json({
          success: false,
          message: "Aadhar number must be exactly 12 digits"
        });
      }
    }

    // Validate pincode if provided
    if (req.body.address?.pincode && req.body.address.pincode.length > 0) {
      if (req.body.address.pincode.length !== 6) {
        return res.status(400).json({
          success: false,
          message: "Pincode must be exactly 6 digits"
        });
      }
    }

    // Find existing profile - Mongoose will automatically cast the string to ObjectId
    let profile = await Profile.findOne({ userId: userId });

    if (!profile) {
      console.log("⚠️ Profile not found, creating new one for userId:", userId);
      
      // If profile doesn't exist, create it
      // Get user details for initial profile creation
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      profile = new Profile({
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone || "",
        ...req.body
      });
    } else {
      // Update existing profile
      console.log("✅ Profile found, updating...");
      
      // Update all fields from request body
      Object.keys(req.body).forEach(key => {
        if (key !== 'fullName' && key !== 'email') { // Don't allow updating immutable fields
          profile[key] = req.body[key];
        }
      });
    }

    await profile.save();
    
    console.log("✅ Profile saved successfully");
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile
    });
  } catch (error: any) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Delete user profile (optional)
// DELETE /api/profile/:userId
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOneAndDelete({ 
      userId: userId
    });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    
    res.json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};