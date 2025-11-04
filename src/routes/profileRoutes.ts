import express from "express";
const router = express.Router();
import { createProfile, getProfile, updateProfile } from "../controllers/profileController";
import { validateRequest } from "../middleware/zodValidation";
import { createProfileDto, updateProfileDto } from "../types/profile.dto";
import { protect, roleCheck } from "../middleware/authMiddleware";

/**
 * @swagger
 * /api/profile:
 *   post:
 *     tags: [Profile]
 *     summary: Create a new user profile
 *     description: Create a comprehensive user profile with health metrics, work preferences, notifications, and security settings. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: User's full name (immutable after creation)
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (required if phone not provided, immutable after creation)
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: User's phone number (required if email not provided)
 *                 example: "9876543210"
 *               bio:
 *                 type: string
 *                 description: User's biography or description
 *                 example: "Fitness enthusiast and yoga lover"
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's profile image
 *                 example: "https://example.com/images/profile.jpg"
 *               aadharNumber:
 *                 type: string
 *                 pattern: "^[0-9]{12}$"
 *                 description: 12-digit Aadhar number
 *                 example: "123456789012"
 *               abhaId:
 *                 type: string
 *                 description: ABHA ID for ABDM/NDHM Health ID
 *                 example: "12-3456-7890-1234"
 *               healthMetrics:
 *                 type: object
 *                 properties:
 *                   weight:
 *                     type: string
 *                     description: User's weight
 *                     example: "70kg"
 *                   height:
 *                     type: string
 *                     description: User's height
 *                     example: "175cm"
 *                   age:
 *                     type: string
 *                     description: User's age
 *                     example: "30"
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                     description: User's gender
 *                     example: "male"
 *                   fitnessGoal:
 *                     type: string
 *                     description: User's fitness goal
 *                     example: "Weight loss"
 *               workPreferences:
 *                 type: object
 *                 properties:
 *                   occupation:
 *                     type: string
 *                     example: "Software Engineer"
 *                   workoutTiming:
 *                     type: string
 *                     example: "Morning"
 *                   availableDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Monday", "Wednesday", "Friday"]
 *                   workStressLevel:
 *                     type: string
 *                     example: "Medium"
 *                   sedentaryHours:
 *                     type: string
 *                     example: "8 hours"
 *                   workoutLocation:
 *                     type: string
 *                     example: "Gym"
 *               notifications:
 *                 type: object
 *                 properties:
 *                   workoutReminders:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                   newContent:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *                   promotionOffers:
 *                     type: boolean
 *                     default: false
 *                     example: false
 *                   appointmentReminders:
 *                     type: boolean
 *                     default: true
 *                     example: true
 *               security:
 *                 type: object
 *                 properties:
 *                   biometricLogin:
 *                     type: boolean
 *                     default: false
 *                     example: false
 *                   twoFactorAuth:
 *                     type: boolean
 *                     default: false
 *                     example: false
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main Street"
 *                   city:
 *                     type: string
 *                     example: "Mumbai"
 *                   state:
 *                     type: string
 *                     example: "Maharashtra"
 *                   pincode:
 *                     type: string
 *                     example: "400001"
 *               membershipStatus:
 *                 type: string
 *                 enum: [active, trial, suspended]
 *                 default: active
 *                 example: "active"
 *               badgeCount:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 example: 0
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["First Workout", "30 Days Streak"]
 *               referralCode:
 *                 type: string
 *                 description: User's referral code
 *                 example: "REF123ABC"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile created successfully"
 *                 data:
 *                   type: object
 *                   description: The created profile object
 *       400:
 *         description: Invalid input data, validation error, or profile already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: object
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.post("/", protect, validateRequest(createProfileDto, 'body'), createProfile);

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile by userId
 *     description: Retrieve a user's profile information by their user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the user
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 userId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 fullName:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phone:
 *                   type: string
 *                   example: "9876543210"
 *                 bio:
 *                   type: string
 *                   example: "Fitness enthusiast"
 *                 profileImage:
 *                   type: string
 *                   example: "https://example.com/images/profile.jpg"
 *                 healthMetrics:
 *                   type: object
 *                 workPreferences:
 *                   type: object
 *                 notifications:
 *                   type: object
 *                 security:
 *                   type: object
 *                 address:
 *                   type: object
 *                 membershipStatus:
 *                   type: string
 *                   example: "active"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile not found"
 *       500:
 *         description: Server error
 */
router.get("/:userId", getProfile);

/**
 * @swagger
 * /api/profile/{userId}:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: Update an existing user profile. Requires authentication. Note that fullName and email are immutable and cannot be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the user
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *                 example: "9876543210"
 *               bio:
 *                 type: string
 *                 description: User's biography or description
 *                 example: "Fitness enthusiast and yoga lover"
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's profile image
 *                 example: "https://example.com/images/profile.jpg"
 *               aadharNumber:
 *                 type: string
 *                 pattern: "^[0-9]{12}$"
 *                 description: 12-digit Aadhar number
 *                 example: "123456789012"
 *               abhaId:
 *                 type: string
 *                 description: ABHA ID for ABDM/NDHM Health ID
 *                 example: "12-3456-7890-1234"
 *               healthMetrics:
 *                 type: object
 *                 properties:
 *                   weight:
 *                     type: string
 *                     example: "72kg"
 *                   height:
 *                     type: string
 *                     example: "175cm"
 *                   age:
 *                     type: string
 *                     example: "30"
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                     example: "male"
 *                   fitnessGoal:
 *                     type: string
 *                     example: "Muscle gain"
 *               workPreferences:
 *                 type: object
 *                 properties:
 *                   occupation:
 *                     type: string
 *                     example: "Software Engineer"
 *                   workoutTiming:
 *                     type: string
 *                     example: "Evening"
 *                   availableDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Monday", "Tuesday", "Thursday"]
 *                   workStressLevel:
 *                     type: string
 *                     example: "High"
 *                   sedentaryHours:
 *                     type: string
 *                     example: "9 hours"
 *                   workoutLocation:
 *                     type: string
 *                     example: "Home"
 *               notifications:
 *                 type: object
 *                 properties:
 *                   workoutReminders:
 *                     type: boolean
 *                     example: true
 *                   newContent:
 *                     type: boolean
 *                     example: false
 *                   promotionOffers:
 *                     type: boolean
 *                     example: true
 *                   appointmentReminders:
 *                     type: boolean
 *                     example: true
 *               security:
 *                 type: object
 *                 properties:
 *                   biometricLogin:
 *                     type: boolean
 *                     example: true
 *                   twoFactorAuth:
 *                     type: boolean
 *                     example: true
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "456 New Street"
 *                   city:
 *                     type: string
 *                     example: "Mumbai"
 *                   state:
 *                     type: string
 *                     example: "Maharashtra"
 *                   pincode:
 *                     type: string
 *                     example: "400002"
 *               membershipStatus:
 *                 type: string
 *                 enum: [active, trial, suspended]
 *                 example: "active"
 *               badgeCount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *               achievements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["First Workout", "30 Days Streak", "100 Workouts"]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   description: The updated profile object
 *       400:
 *         description: Invalid input data or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: object
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.put("/:userId", protect, updateProfile);

export default router;
