import express from "express";
import { getProfile, updateProfile } from "../controllers/profileService";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         height:
 *           type: number
 *           description: User's height in cm
 *         weight:
 *           type: number
 *           description: User's weight in kg
 *         age:
 *           type: number
 *           description: User's age
 *         goals:
 *           type: array
 *           items:
 *             type: string
 *           description: User's fitness goals
 */

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */
router.get("/:userId", getProfile);

/**
 * @swagger
 * /api/profile/{userId}:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 */
router.put("/:userId", updateProfile);

export default router;
