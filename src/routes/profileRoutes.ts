// routes/profileRoutes.ts
import express from "express";
const router = express.Router();
import { 
  createProfile, 
  getProfile, 
  updateProfile
//   deleteProfile 
} from "../controllers/profileController";
import { validateRequest } from "../middleware/zodValidation";
import { createProfileDto, updateProfileDto } from "../types/profile.dto";
import { protect, roleCheck } from "../middleware/authMiddleware";

/**
 * @route   POST /api/profile
 * @desc    Create a new user profile
 * @access  Private
 */
router.post(
  "/", 
  protect, 
  validateRequest(createProfileDto, 'body'), 
  createProfile
);

/**
 * @route   GET /api/profile/:userId
 * @desc    Get user profile by userId
 * @access  Public (or Private based on your requirements)
 */
router.get("/:userId", getProfile);

/**
 * @route   PUT /api/profile/:userId
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/:userId", 
  protect, 
  updateProfile
);

// /**
//  * @route   DELETE /api/profile/:userId
//  * @desc    Delete user profile
//  * @access  Private
//  */
// router.delete(
//   "/:userId", 
//   protect, 
//   deleteProfile
// );

export default router;