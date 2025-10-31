import express from "express";
import { registerUser, loginUser, changePassword, registerAdmin, verifyOtpAndRegister, getMe } from "../controllers/authController";
import sendEmail from '../utils/sendEmail';
import { roleCheck, protect } from "../middleware/authMiddleware";
import { registerUserDto, registerAdminDto, loginUserDto } from "../types/user.dto";
import { validateRequest } from "../middleware/zodValidation";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register/admin:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new admin (superadmin only)
 *     description: Register a new admin account. Requires authentication and superadmin role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Admin's full name
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Admin User"
 *               age:
 *                 type: integer
 *                 description: Admin's age (optional)
 *                 minimum: 1
 *                 maximum: 150
 *                 example: 35
 *               phone:
 *                 type: string
 *                 description: Admin's phone number (optional)
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address (required)
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 description: Admin's password (required)
 *                 minLength: 6
 *                 maxLength: 100
 *                 example: "secureAdminPassword123"
 *     responses:
 *       201:
 *         description: Admin successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
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
 *       403:
 *         description: Forbidden - superadmin role required
 *       500:
 *         description: Server error
 */
router.post(
    '/register/admin',
    protect,
    roleCheck(['superadmin']),
    validateRequest(registerAdminDto),
    registerAdmin
);


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user with Indian standards/ABDM compliance
 *     description: Register a new user account. Either email or phone is required. Password is required unless using OAuth. Consent and privacy notice acceptance are mandatory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - consent
 *               - privacyNoticeAccepted
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "John Doe"
 *               age:
 *                 type: integer
 *                 description: User's age
 *                 minimum: 1
 *                 maximum: 150
 *                 example: 30
 *               phone:
 *                 type: string
 *                 description: User's phone number (required if email not provided)
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (required if phone not provided)
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: User's password (required unless using OAuth)
 *                 minLength: 6
 *                 maxLength: 100
 *                 example: "securePassword123"
 *               role:
 *                 type: string
 *                 enum: [user, consultant]
 *                 default: user
 *                 description: User's role in the system
 *                 example: "user"
 *               consent:
 *                 type: boolean
 *                 description: Consent required as per Indian standards/ABDM (must be true)
 *                 example: true
 *               privacyNoticeAccepted:
 *                 type: boolean
 *                 description: Privacy notice acceptance (must be true)
 *                 example: true
 *               aadharNumber:
 *                 type: string
 *                 description: Aadhar number (optional)
 *                 example: "1234-5678-9012"
 *               abhaId:
 *                 type: string
 *                 description: ABHA ID (optional)
 *                 example: "12-3456-7890-1234"
 *               oauthProvider:
 *                 type: string
 *                 description: OAuth provider name (if using OAuth login)
 *                 example: "google"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
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
 *       500:
 *         description: Server error
 */
router.post('/register', validateRequest(registerUserDto), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: Login using email, phone, or a generic identifier (email or phone)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (optional if phone or identifier is provided)
 *                 example: "user@example.com"
 *               phone:
 *                 type: string
 *                 description: User's phone number (optional if email or identifier is provided)
 *                 example: "9876543210"
 *               identifier:
 *                 type: string
 *                 description: Email or phone number (optional if email or phone is provided)
 *                 example: "user@example.com or 9876543210"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', validateRequest(loginUserDto), loginUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */
router.post('/change-password', changePassword);

/**
 * @swagger
 * /api/auth/check-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Check if email exists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email check result
 */
// router.post('/check-email', checkEmail);

/**
 * @swagger
 * /api/auth/send-reset-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Send password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 */
// router.post("/send-reset-email", sendResetEmail);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify OTP for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp', verifyOtpAndRegister);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
// router.post('/reset-password', resetPassword);

router.get('/test-email', async (req, res) => {
    try {
        await sendEmail({
            to: "khavyameenu@gmail.com",
            subject: "Test Email",
            html: "<h1>Hello from Gym App!</h1>"
        });
        res.json({ success: true, message: "Email sent successfully!" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current authenticated user information
 *     description: Retrieve the current authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f8b8c12345678901234567"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     phone:
 *                       type: string
 *                       example: "9876543210"
 *                     age:
 *                       type: integer
 *                       example: 30
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *                       example: "male"
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: "1993-01-15"
 *                     role:
 *                       type: string
 *                       enum: [user, admin, consultant, superadmin]
 *                       example: "user"
 *                     address:
 *                       type: object
 *                       properties:
 *                         street:
 *                           type: string
 *                         city:
 *                           type: string
 *                         state:
 *                           type: string
 *                         pincode:
 *                           type: string
 *                     aadharNumber:
 *                       type: string
 *                       example: "123456789012"
 *                     abhaId:
 *                       type: string
 *                       example: "12-3456-7890-1234"
 *                     emailVerified:
 *                       type: boolean
 *                       example: true
 *                     phoneVerified:
 *                       type: boolean
 *                       example: false
 *                     oauthProvider:
 *                       type: string
 *                       enum: [google, facebook, apple]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token provided"
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
 *       500:
 *         description: Server error
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
 *                   example: "Server error while fetching user information"
 */
router.get('/me', protect, getMe);

export default router;
