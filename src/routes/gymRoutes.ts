import express from 'express';
import { protect, roleCheck } from '../middleware/authMiddleware';
import {
    createGym,
    getGyms,
    getGymById,
    updateGym,
    deleteGym,
    getNearbyGyms
} from '../controllers/gymController';
import { validateRequest } from '../middleware/zodValidation';
import { createGymDto } from '../types/gym.dto';

const router = express.Router();


router.get('/', getGyms);

/**
 * @swagger
 * /api/gyms:
 *   post:
 *     tags: [Gym Management]
 *     summary: Create a new gym center (Admin/Superadmin only)
 *     description: Create a new gym center and associate it with an existing admin user. Requires authentication and admin/superadmin role.
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
 *               - address
 *               - adminEmail
 *             properties:
 *               name:
 *                 type: string
 *                 description: Gym center name
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: "FitZone Gym & Fitness"
 *               address:
 *                 type: string
 *                 description: Complete address of the gym center
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: "123 Main Street, Downtown, Mumbai, Maharashtra 400001"
 *               phone:
 *                 type: string
 *                 description: Contact phone number (optional)
 *                 example: "+91-9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Gym contact email (optional)
 *                 example: "contact@fitzone.com"
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the existing admin user to be associated with this gym
 *                 example: "admin@fitzone.com"
 *               location:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 description: Geospatial location of the gym center
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     default: Point
 *                     description: GeoJSON type (must be "Point")
 *                   coordinates:
 *                     type: array
 *                     description: Array of [longitude, latitude]
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     example: [72.8777, 19.0760]
 *               amenities:
 *                 type: array
 *                 description: List of amenities available at the gym (optional)
 *                 items:
 *                   type: string
 *                 example: ["Swimming Pool", "Sauna", "Personal Training", "Group Classes", "Cardio Equipment"]
 *               price:
 *                 type: number
 *                 description: Membership price (optional)
 *                 minimum: 0
 *                 example: 2999
 *               rating:
 *                 type: number
 *                 description: Gym rating (optional)
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       201:
 *         description: Gym created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gym created successfully"
 *                 gym:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "FitZone Gym & Fitness"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street, Downtown, Mumbai, Maharashtra 400001"
 *                     phone:
 *                       type: string
 *                       example: "+91-9876543210"
 *                     email:
 *                       type: string
 *                       example: "contact@fitzone.com"
 *                     admin:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     location:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: "Point"
 *                         coordinates:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [72.8777, 19.0760]
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Swimming Pool", "Sauna", "Personal Training"]
 *                     price:
 *                       type: number
 *                       example: 2999
 *                     rating:
 *                       type: number
 *                       example: 4.5
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 existingAdmin:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                     name:
 *                       type: string
 *                       example: "Admin User"
 *                     email:
 *                       type: string
 *                       example: "admin@fitzone.com"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       400:
 *         description: Bad request - Admin email does not exist or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin with this email does not exist"
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - admin or superadmin role required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error while creating gym"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
router.post('/', protect, roleCheck(['admin', 'superadmin']), validateRequest(createGymDto), createGym);

// NEW Route for discovery/search
router.get('/nearby', getNearbyGyms);

router.route('/:id')
    .get(getGymById)
    .put(protect, updateGym)
    .delete(protect, deleteGym);

export default router;
