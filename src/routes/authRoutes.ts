import express from "express";
import { registerUser, loginUser, changePassword, checkEmail, sendResetEmail, verifyOtp, resetPassword, registerAdmin } from "../services/authService";
import sendEmail from '../utils/sendEmail';
import { roleCheck, protect } from "../middleware/authMiddleware";
import { registerUserDto, registerAdminDto } from "../types/user.dto";
import { validateRequest } from "../middleware/zodValidation";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register/admin:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin successfully registered
 *       400:
 *         description: Invalid input data
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
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: enum
 *                 enum: [user, consultant]
 *     responses:
 *       200:
 *         description: User successfully registered
 *       400:
 *         description: Invalid input data
 */
router.post('/register', validateRequest(registerUserDto), registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginUser);

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
router.post('/check-email', checkEmail);

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
router.post("/send-reset-email", sendResetEmail);

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
router.post('/verify-otp', verifyOtp);

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
router.post('/reset-password', resetPassword);

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

export default router;
