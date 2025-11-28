import express from 'express';
import {
  submitWellnessAnswers,
  getWellnessAnswers,
  getAllWellnessAnswers,
  deleteWellnessAnswers
} from '../controllers/wellnessController';
import { protect, roleCheck } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/wellness/submit:
 *   post:
 *     tags: [Wellness]
 *     summary: Submit wellness questionnaire answers
 *     description: Submit or update wellness questionnaire answers for a user or consultant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - answers
 *               - userRole
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user
 *                 example: "64f8b8c12345678901234567"
 *               userRole:
 *                 type: string
 *                 enum: [user, consultant]
 *                 description: Role of the user submitting answers
 *                 example: "user"
 *               answers:
 *                 type: object
 *                 description: Key-value pairs of question IDs and answers
 *                 example:
 *                   "1": "8"
 *                   "2": "Yes"
 *                   "3": ["Option A", "Option B"]
 *                   "4": "I exercise regularly"
 *     responses:
 *       201:
 *         description: Wellness answers submitted successfully
 *       200:
 *         description: Wellness answers updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/submit', submitWellnessAnswers);

/**
 * @swagger
 * /api/wellness/{userId}:
 *   get:
 *     tags: [Wellness]
 *     summary: Get wellness answers for a specific user
 *     description: Retrieve wellness questionnaire answers for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Wellness answers retrieved successfully
 *       404:
 *         description: Wellness answers not found
 *       500:
 *         description: Server error
 */
router.get('/:userId', getWellnessAnswers);

/**
 * @swagger
 * /api/wellness:
 *   get:
 *     tags: [Wellness]
 *     summary: Get all wellness answers (Admin/Superadmin only)
 *     description: Retrieve all wellness questionnaire answers with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, consultant]
 *         description: Filter by user role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Wellness answers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', protect, roleCheck(['admin', 'superadmin']), getAllWellnessAnswers);

/**
 * @swagger
 * /api/wellness/{userId}:
 *   delete:
 *     tags: [Wellness]
 *     summary: Delete wellness answers for a user (Admin only)
 *     description: Delete wellness questionnaire answers for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Wellness answers deleted successfully
 *       404:
 *         description: Wellness answers not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/:userId', protect, roleCheck(['admin', 'superadmin']), deleteWellnessAnswers);

export default router;