import express from "express";
import { protect } from "../middleware/authMiddleware";
import { createConsultant, getConsultants, getConsultantById, updateConsultant, adminOnboardConsultant } from "../controllers/consultantController";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Consultant:
 *       type: object
 *       required:
 *         - user
 *         - gym
 *         - name
 *         - specialty
 *         - consent
 *       properties:
 *         user:
 *           type: string
 *           description: Reference to User ID
 *         gym:
 *           type: string
 *           description: Reference to Gym ID
 *         name:
 *           type: string
 *           description: Consultant name
 *         specialty:
 *           type: string
 *           description: Consultant specialty (e.g., Dietician, Yoga Trainer)
 *         description:
 *           type: string
 *           description: Description of the consultant
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the consultant
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         yearsOfExperience:
 *           type: number
 *           minimum: 0
 *           maximum: 50
 *           description: Years of professional experience
 *         certifications:
 *           type: array
 *           items:
 *             type: string
 *           description: List of certifications
 *         badges:
 *           type: array
 *           items:
 *             type: string
 *           description: Achievement badges
 *         qualification:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               degree:
 *                 type: string
 *               board:
 *                 type: string
 *               year:
 *                 type: number
 *               field:
 *                 type: string
 *         modeOfTraining:
 *           type: string
 *           enum: [online, offline, hybrid]
 *           description: Mode of training delivery
 *         pricing:
 *           type: object
 *           properties:
 *             perSession:
 *               type: number
 *             perMonth:
 *               type: number
 *             perWeek:
 *               type: number
 *             perDay:
 *               type: number
 *             currency:
 *               type: string
 *               default: INR
 *             packages:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   duration:
 *                     type: string
 *                   price:
 *                     type: number
 *         availability:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [Available Now, Available Tomorrow, Busy]
 *             nextSlot:
 *               type: string
 *             workingDays:
 *               type: array
 *               items:
 *                 type: string
 *             workingHours:
 *               type: object
 *               properties:
 *                 start:
 *                   type: string
 *                 end:
 *                   type: string
 *         contact:
 *           type: object
 *           required:
 *             - phone
 *             - email
 *           properties:
 *             phone:
 *               type: string
 *               description: Indian 10-digit phone number
 *             email:
 *               type: string
 *               format: email
 *             website:
 *               type: string
 *             location:
 *               type: object
 *               properties:
 *                 street:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 pincode:
 *                   type: string
 *         consent:
 *           type: boolean
 *           description: Privacy consent (required as per Indian standards/ABDM)
 *         privacyNoticeAccepted:
 *           type: boolean
 *           description: Privacy notice acceptance
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         reviewsCount:
 *           type: number
 *         image:
 *           type: string
 *           description: Profile image URL
 *         isVerified:
 *           type: boolean
 *     AdminOnboardConsultant:
 *       type: object
 *       required:
 *         - email
 *         - phone
 *         - password
 *         - gym
 *         - name
 *         - specialty
 *         - consent
 *         - privacyNoticeAccepted
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Consultant email for user account
 *         phone:
 *           type: string
 *           description: Consultant phone for user account
 *         password:
 *           type: string
 *           format: password
 *           description: Password for consultant user account
 *         name:
 *           type: string
 *           description: Consultant name
 *         gym:
 *           type: string
 *           description: Reference to Gym ID
 *         specialty:
 *           type: string
 *           description: Consultant specialty
 *         consent:
 *           type: boolean
 *           description: Privacy consent (required)
 *         privacyNoticeAccepted:
 *           type: boolean
 *           description: Privacy notice acceptance (required)
 *         description:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         contact:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             email:
 *               type: string
 */

/**
 * @swagger
 * /api/consultants/admin-onboard:
 *   post:
 *     tags: [Consultants]
 *     summary: Admin onboards a consultant (creates user account + profile)
 *     description: Admin creates both a consultant user account and profile in one step
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminOnboardConsultant'
 *           example:
 *             email: consultant@example.com
 *             phone: "9876543210"
 *             password: SecurePass123!
 *             name: Dr. John Doe
 *             gym: 507f1f77bcf86cd799439011
 *             specialty: Dietician
 *             consent: true
 *             privacyNoticeAccepted: true
 *             description: Experienced dietician with 10 years of practice
 *             gender: male
 *             yearsOfExperience: 10
 *             modeOfTraining: hybrid
 *             contact:
 *               phone: "9876543210"
 *               email: consultant@example.com
 *     responses:
 *       201:
 *         description: Consultant onboarded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 consultant:
 *                   $ref: '#/components/schemas/Consultant'
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.post('/admin-onboard', protect, adminOnboardConsultant);

/**
 * @swagger
 * /api/consultants:
 *   post:
 *     tags: [Consultants]
 *     summary: Create consultant profile for logged-in user
 *     description: Create a consultant profile for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gym
 *               - name
 *               - specialty
 *               - consent
 *               - privacyNoticeAccepted
 *             properties:
 *               gym:
 *                 type: string
 *                 description: Reference to Gym ID
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               description:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               yearsOfExperience:
 *                 type: number
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               modeOfTraining:
 *                 type: string
 *                 enum: [online, offline, hybrid]
 *               consent:
 *                 type: boolean
 *               privacyNoticeAccepted:
 *                 type: boolean
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *           example:
 *             gym: 507f1f77bcf86cd799439011
 *             name: Jane Smith
 *             specialty: Yoga Trainer
 *             description: Certified yoga instructor specializing in Hatha and Vinyasa
 *             gender: female
 *             yearsOfExperience: 5
 *             certifications: ["RYT 200", "RYT 500"]
 *             modeOfTraining: hybrid
 *             consent: true
 *             privacyNoticeAccepted: true
 *             contact:
 *               phone: "9876543210"
 *               email: jane@example.com
 *     responses:
 *       201:
 *         description: Consultant profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultant'
 *       400:
 *         description: Bad request - validation error or profile already exists
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.post("/", protect, createConsultant);

/**
 * @swagger
 * /api/consultants:
 *   get:
 *     tags: [Consultants]
 *     summary: Get all consultants
 *     description: Retrieve a list of all consultants with their user details
 *     responses:
 *       200:
 *         description: List of consultants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consultant'
 *       500:
 *         description: Server error
 */
router.get("/", getConsultants);

/**
 * @swagger
 * /api/consultants/{id}:
 *   get:
 *     tags: [Consultants]
 *     summary: Get consultant by ID
 *     description: Retrieve detailed information about a specific consultant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Consultant ID
 *     responses:
 *       200:
 *         description: Consultant details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultant'
 *       404:
 *         description: Consultant not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getConsultantById);

/**
 * @swagger
 * /api/consultants:
 *   put:
 *     tags: [Consultants]
 *     summary: Update consultant profile
 *     description: Update the consultant profile for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gym:
 *                 type: string
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               description:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               yearsOfExperience:
 *                 type: number
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               badges:
 *                 type: array
 *                 items:
 *                   type: string
 *               modeOfTraining:
 *                 type: string
 *                 enum: [online, offline, hybrid]
 *               pricing:
 *                 type: object
 *                 properties:
 *                   perSession:
 *                     type: number
 *                   perMonth:
 *                     type: number
 *               availability:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [Available Now, Available Tomorrow, Busy]
 *                   workingDays:
 *                     type: array
 *                     items:
 *                       type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   website:
 *                     type: string
 *               image:
 *                 type: string
 *           example:
 *             specialty: Senior Yoga Trainer
 *             description: Updated profile with new specialization
 *             yearsOfExperience: 7
 *             badges: ["Top Rated", "Verified"]
 *             pricing:
 *               perSession: 1500
 *               perMonth: 5000
 *             availability:
 *               status: Available Now
 *               workingDays: ["Mon", "Wed", "Fri", "Sat"]
 *     responses:
 *       200:
 *         description: Consultant profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consultant'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Consultant profile not found
 *       500:
 *         description: Server error
 */
router.put("/", protect, updateConsultant);



export default router;
