import express, { Request } from 'express';
import { protect, roleCheck } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/zodValidation';
import { createGymDto, updateGymDto, gymIdParamDto, CreateGymDto } from '../types/gym.dto';
import {
    createGym,
    getGyms,
    getGymById,
    updateGym,
    deleteGym,
} from '../services/gymService';
import { AuthRequest } from '../types/request-response.dto';

const router = express.Router();

/**
 * @swagger
 * /api/gyms:
 *   get:
 *     tags: [Gyms]
 *     summary: Get all gyms
 *     description: Retrieve a list of all gym centers (requires superadmin or admin role)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of gyms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gym'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *   post:
 *     tags: [Gyms]
 *     summary: Create a new gym center
 *     description: Create a new gym center with admin assignment (requires superadmin or admin role)
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
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Gym center name
 *                 example: "FitLife Gym Center"
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Physical address of the gym
 *                 example: "123 Main Street, New York, NY 10001"
 *               phone:
 *                 type: string
 *                 description: Contact phone number (optional, must match phone format)
 *                 example: "+1 (555) 123-4567"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Gym contact email (optional)
 *                 example: "contact@fitlife.com"
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the admin user to assign to this gym
 *                 example: "admin@fitlife.com"
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *                 default: basic
 *                 description: Subscription plan for the gym
 *                 example: "premium"
 *     responses:
 *       201:
 *         description: Gym created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/',
    protect,
    roleCheck(['superadmin', 'admin']),
    (req, res) => getGyms(req, res)
);


router.post('/',
    protect,
    roleCheck(['superadmin', 'admin']),
    validateRequest(createGymDto),
    (req: AuthRequest<CreateGymDto>, res) => {
        console.log("👉 Incoming payload:", req.body);
        console.log("👉 User making request:", req?.user);
        createGym(req.body, res);
    }
);

/**
 * @swagger
 * /api/gyms/{id}:
 *   get:
 *     tags: [Gyms]
 *     summary: Get gym by ID
 *     description: Retrieve detailed information about a specific gym center
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique gym center ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Gym details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
 *       404:
 *         description: Gym not found
 *   put:
 *     tags: [Gyms]
 *     summary: Update gym details
 *     description: Update information for an existing gym center (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique gym center ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Updated gym center name
 *                 example: "FitLife Premium Gym"
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Updated physical address
 *                 example: "456 Oak Avenue, New York, NY 10002"
 *               phone:
 *                 type: string
 *                 description: Updated contact phone number
 *                 example: "+1 (555) 987-6543"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated gym contact email
 *                 example: "info@fitlife.com"
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *                 description: Updated subscription plan
 *                 example: "enterprise"
 *             description: All fields are optional - only provide fields to update
 *     responses:
 *       200:
 *         description: Gym updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Gym not found
 *   delete:
 *     tags: [Gyms]
 *     summary: Delete a gym
 *     description: Permanently delete a gym center (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique gym center ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Gym deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Gym not found
 */
router.route('/:id')
    .get(getGymById)
    .put(protect, validateRequest(updateGymDto), updateGym)
    .delete(protect, deleteGym);

export default router;
