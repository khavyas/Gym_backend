import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
} from '../controllers/appointmentController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - userId
 *         - consultantId
 *         - date
 *         - time
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user booking the appointment
 *         consultantId:
 *           type: string
 *           description: ID of the consultant
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the appointment
 *         time:
 *           type: string
 *           description: Time slot of the appointment
 *         status:
 *           type: string
 *           enum: [scheduled, cancelled, completed]
 *           description: Current status of the appointment
 *         notes:
 *           type: string
 *           description: Additional notes for the appointment
 */

// Protect all appointment routes
router.use(protect);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create a new appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, cancelled, completed]
 *         description: Filter by appointment status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', getAppointments);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     tags: [Appointments]
 *     summary: Update appointment details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id', updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   post:
 *     tags: [Appointments]
 *     summary: Cancel an appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Appointment not found
 */
router.post('/:id/cancel', cancelAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Delete an appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', deleteAppointment);

export default router;
