import { Router } from 'express';
import {
  getCheckInQuestions,
  submitCheckIn,
  getAllResponses,
  getUserResponse,
} from '../controllers/checkInController';
import { protect, roleCheck } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/zodValidation';
import { checkInResponseDto } from '../types/checkIn.dto';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckInQuestion:
 *       type: object
 *       required:
 *         - field
 *         - label
 *         - type
 *       properties:
 *         field:
 *           type: string
 *           description: Unique key for the question
 *         label:
 *           type: string
 *           description: Display label for the question
 *         type:
 *           type: string
 *           enum: [scale, number, yesno, dropdown]
 *         min:
 *           type: number
 *         max:
 *           type: number
 *         unit:
 *           type: string
 *         lowLabel:
 *           type: string
 *         highLabel:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         optional:
 *           type: boolean
 *         invertedScore:
 *           type: boolean
 *     CheckInDomain:
 *       type: object
 *       required:
 *         - id
 *         - label
 *         - questions
 *       properties:
 *         id:
 *           type: string
 *           description: Domain identifier
 *         label:
 *           type: string
 *         icon:
 *           type: string
 *         color:
 *           type: string
 *         gradientColors:
 *           type: array
 *           items:
 *             type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckInQuestion'
 *     CheckInSubmitRequest:
 *       type: object
 *       required:
 *         - userId
 *         - answers
 *       properties:
 *         userId:
 *           type: string
 *         answers:
 *           type: array
 *           description: Array of answers with questionId and value
 *           items:
 *             type: object
 *             required:
 *               - questionId
 *               - value
 *             properties:
 *               questionId:
 *                 type: string
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: array
 *                     items:
 *                       type: string
 *     CheckInResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: array
 *                     items:
 *                       type: string
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ─────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────

// GET /api/checkin/questions
// Any logged-in user can fetch questions
/**
 * @swagger
 * /api/checkin/questions:
 *   get:
 *     tags: [CheckIn]
 *     summary: Get active check-in questions grouped by domain
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-in questions grouped by domain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 domains:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CheckInDomain'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to fetch questions
 */
router.get('/questions', protect, getCheckInQuestions);

// ─────────────────────────────────────────────
// RESPONSES
// ─────────────────────────────────────────────

// POST /api/checkin/submit
// User submits their check-in answers
/**
 * @swagger
 * /api/checkin/submit:
 *   post:
 *     tags: [CheckIn]
 *     summary: Submit or update a user's check-in answers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckInSubmitRequest'
 *     responses:
 *       200:
 *         description: Check-in submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 response:
 *                   $ref: '#/components/schemas/CheckInResponse'
 *       400:
 *         description: userId and answers are required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to submit check-in
 */
router.post('/submit', protect, validateRequest(checkInResponseDto), submitCheckIn);

// GET /api/checkin/responses
// Admin only — view all users' responses
/**
 * @swagger
 * /api/checkin/responses:
 *   get:
 *     tags: [CheckIn]
 *     summary: Get all users' check-in responses (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all check-in responses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalResponses:
 *                   type: number
 *                 responses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CheckInResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch responses
 */
router.get('/responses', protect, roleCheck(['admin', 'superadmin']), getAllResponses);

// GET /api/checkin/responses/:userId
// Get a specific user's response (user themselves or admin)
/**
 * @swagger
 * /api/checkin/responses/{userId}:
 *   get:
 *     tags: [CheckIn]
 *     summary: Get a specific user's check-in response
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check-in response for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   $ref: '#/components/schemas/CheckInResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No check-in response found for this user
 *       500:
 *         description: Failed to fetch response
 */
router.get('/responses/:userId', protect, getUserResponse);

export default router;
