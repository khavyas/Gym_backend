import express from 'express';
import { logWaterIntake, getMyWaterIntake, deleteWaterIntake } from '../controllers/waterService';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WaterIntake:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount of water intake in ml
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of water intake
 */

/**
 * @swagger
 * /api/water:
 *   post:
 *     tags: [Water Intake]
 *     summary: Log water intake
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount of water in ml
 *     responses:
 *       201:
 *         description: Water intake logged successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', protect, logWaterIntake);

/**
 * @swagger
 * /api/water:
 *   get:
 *     tags: [Water Intake]
 *     summary: Get user's water intake history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of water intake records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WaterIntake'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', protect, getMyWaterIntake);

/**
 * @swagger
 * /api/water/{id}:
 *   delete:
 *     tags: [Water Intake]
 *     summary: Delete a water intake record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Water intake record ID
 *     responses:
 *       200:
 *         description: Water intake record deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Water intake record not found
 */
router.delete('/:id', protect, deleteWaterIntake);

export default router;
