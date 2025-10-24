const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createGym, getGyms, getGymById, updateGym, deleteGym, } = require('../services/gymService');
const router = express.Router();
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
/**
 * @swagger
 * /api/gyms:
 *   get:
 *     tags: [Gyms]
 *     summary: Get all gyms
 *     responses:
 *       200:
 *         description: List of gyms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gym'
 *   post:
 *     tags: [Gyms]
 *     summary: Create a new gym
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gym'
 *     responses:
 *       201:
 *         description: Gym created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/')
    .get(getGyms)
    .post(protect, createGym);
/**
 * @swagger
 * /api/gyms/{id}:
 *   get:
 *     tags: [Gyms]
 *     summary: Get gym by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *     responses:
 *       200:
 *         description: Gym details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gym'
 *       404:
 *         description: Gym not found
 *   put:
 *     tags: [Gyms]
 *     summary: Update gym details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gym'
 *     responses:
 *       200:
 *         description: Gym updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Gym not found
 *   delete:
 *     tags: [Gyms]
 *     summary: Delete a gym
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
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
    .put(protect, updateGym)
    .delete(protect, deleteGym);
module.exports = router;
