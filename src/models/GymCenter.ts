import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const gymCenterSchema = new mongoose.Schema(
    {
        gymId: {
            type: String,
            unique: true,
            default: () => `GYM-${uuidv4()}`,
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        subscriptionPlan: {
            type: String,
            enum: ['basic', 'premium', 'enterprise'],
            default: 'basic'
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Gym:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the gym
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of available facilities
 *         timings:
 *           type: object
 *           properties:
 *             open:
 *               type: string
 *             close:
 *               type: string
 */

export default mongoose.model('GymCenter', gymCenterSchema);
