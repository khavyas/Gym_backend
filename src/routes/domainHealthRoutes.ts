import express from 'express';
import { getDHI } from '../controllers/DomainHealthScoreController';
import { protect, roleCheck } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/dhi/consultant-red-alerts:
 *   get:
 *     tags: [DHI]
 *     summary: Get red DHI records for the authenticated consultant
 *     description: Returns the latest red-status Domain Health Index entries for users across the authenticated consultant's assigned domains.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: DHI records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   description: Total number of red DHI entries returned
 *                 dhi:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         description: Populated user document
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           role:
 *                             type: string
 *                       domain:
 *                         type: object
 *                         description: Populated domain document
 *                       windowType:
 *                         type: string
 *                         enum: [14_day]
 *                       windowStart:
 *                         type: string
 *                         format: date-time
 *                       windowEnd:
 *                         type: string
 *                         format: date-time
 *                       dataPointCount:
 *                         type: integer
 *                       metrics:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             questionId:
 *                               type: object
 *                               description: Populated check-in question document
 *                             averageValue:
 *                               type: number
 *                               nullable: true
 *                               description: Raw average of numeric answers for the question when available
 *                             normalizedAverageValue:
 *                               type: number
 *                             normalizedAverageWeightedValue:
 *                               type: number
 *                             weight:
 *                               type: number
 *                       dhi:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [green, yellow, red]
 *                       sourceResponseIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       calculatedAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - only consultants can access DHI data
 *       404:
 *         description: Consultant profile not found
 *       500:
 *         description: Server error
 */
router.get('/consultant-red-alerts', protect, roleCheck(['consultant']), getDHI);

export default router;
