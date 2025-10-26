import express from "express";
import { protect } from "../middleware/authMiddleware";
import { createConsultant, getConsultants, getConsultantById, updateConsultant } from "../controllers/consultantService";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Consultant:
 *       type: object
 *       required:
 *         - name
 *         - specialization
 *       properties:
 *         name:
 *           type: string
 *           description: Consultant's name
 *         specialization:
 *           type: string
 *           description: Consultant's area of expertise
 *         experience:
 *           type: number
 *           description: Years of experience
 *         availability:
 *           type: object
 *           properties:
 *             days:
 *               type: array
 *               items:
 *                 type: string
 *             time:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/consultants:
 *   post:
 *     tags: [Consultants]
 *     summary: Create a new consultant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Consultant'
 *     responses:
 *       201:
 *         description: Consultant created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/", protect, createConsultant);

/**
 * @swagger
 * /api/consultants:
 *   get:
 *     tags: [Consultants]
 *     summary: Get all consultants
 *     responses:
 *       200:
 *         description: List of consultants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultant'
 */
router.get("/", getConsultants);

/**
 * @swagger
 * /api/consultants/{id}:
 *   get:
 *     tags: [Consultants]
 *     summary: Get consultant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Consultant ID
 *     responses:
 *       200:
 *         description: Consultant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultant'
 *       404:
 *         description: Consultant not found
 */
router.get("/:id", getConsultantById);

/**
 * @swagger
 * /api/consultants:
 *   put:
 *     tags: [Consultants]
 *     summary: Update consultant details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consultantId:
 *                 type: string
 *                 description: ID of the consultant to update
 *               updates:
 *                 $ref: '#/components/schemas/Consultant'
 *     responses:
 *       200:
 *         description: Consultant updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Consultant not found
 */
router.put("/", protect, updateConsultant);

export default router;
