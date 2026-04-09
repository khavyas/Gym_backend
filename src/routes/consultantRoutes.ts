import express from "express";
import { protect } from "../middleware/authMiddleware";
import { registerConsultant, getConsultants, updateConsultant } from "../controllers/consultantController";
import { getConsultantsQueryDto, registerConsultantDto } from "../types/user.dto";
import { validateRequest } from "../middleware/zodValidation";

const router = express.Router();


/**
 * @swagger
 * /api/consultants/register:
 *   post:
 *     tags: [Consultants]
 *     summary: Register a new consultant
 *     description: Register a new consultant account. Either email or phone is required. Password is optional. If domains are provided, each value must match an existing `Domain.domainId`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - consent
 *               - privacyNoticeAccepted
 *             properties:
 *               name:
 *                 type: string
 *                 description: Consultant's full name
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Dr. Priya Sharma"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Consultant's gender (optional)
 *               age:
 *                 type: integer
 *                 description: Consultant's age (optional)
 *                 minimum: 1
 *                 maximum: 150
 *                 example: 34
 *               weight:
 *                 type: number
 *                 description: Consultant's weight (optional)
 *                 example: 68
 *               phone:
 *                 type: string
 *                 description: Consultant's phone number (required if email not provided)
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Consultant's email address (required if phone not provided)
 *                 example: "priya.sharma@example.com"
 *               password:
 *                 type: string
 *                 description: Consultant's password (optional)
 *                 minLength: 6
 *                 maxLength: 100
 *                 example: "securePassword123"
 *               consent:
 *                 type: boolean
 *                 description: Consent required as per Indian standards/ABDM (must be true)
 *                 example: true
 *               privacyNoticeAccepted:
 *                 type: boolean
 *                 description: Privacy notice acceptance (must be true)
 *                 example: true
 *               aadharNumber:
 *                 type: string
 *                 description: Aadhar number (optional)
 *                 example: "123456789012"
 *               abhaId:
 *                 type: string
 *                 description: ABHA ID (optional)
 *                 example: "12-3456-7890-1234"
 *               gym:
 *                 type: string
 *                 description: GymCenter document id (optional)
 *                 example: "67f3c6f7a1b2c3d4e5f60789"
 *               domain:
 *                 type: array
 *                 description: Domain identifiers to resolve against `Domain.domainId` (optional)
 *                 items:
 *                   type: string
 *                 example: ["sleep", "tech"]
 *               specialty:
 *                 type: string
 *                 description: Consultant specialty (optional)
 *                 example: "Dietician"
 *               description:
 *                 type: string
 *                 description: Consultant bio/description (optional)
 *                 example: "Certified nutrition consultant with 8 years of experience."
 *               meetingLink:
 *                 type: string
 *                 description: Meeting link for consultant sessions (optional)
 *                 example: "https://meet.example.com/priya"
 *               yearsOfExperience:
 *                 type: integer
 *                 description: Years of experience (optional)
 *                 minimum: 0
 *                 maximum: 50
 *                 example: 8
 *               certifications:
 *                 type: array
 *                 description: Consultant certifications (optional)
 *                 items:
 *                   type: string
 *                 example: ["ACE Certified", "Precision Nutrition"]
 *               modeOfTraining:
 *                 type: string
 *                 enum: [online, offline, hybrid]
 *                 description: Training mode (optional)
 *                 example: "online"
 *               location:
 *                 type: string
 *                 description: Consultant location/city (optional)
 *                 example: "Bengaluru"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Consultant website (optional)
 *                 example: "https://priyasharma.example.com"
 *               isHiwoxMember:
 *                 type: boolean
 *                 description: Whether the consultant is a Hiwox member (optional)
 *                 example: false
 *     responses:
 *       201:
 *         description: Consultant successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *                 consultantId:
 *                   type: string
 *                 gymId:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid input data, one or more domainIds, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.post('/register', validateRequest(registerConsultantDto), registerConsultant);

/**
 * @swagger
 * /api/consultants:
 *   get:
 *     tags: [Consultants]
 *     summary: Get all consultants with optional filtering and pagination
 *     description: Retrieve consultants with their linked user, gym, and domain data. Only consultants having valid linked profiles are returned.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Filter by consultant ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by linked user ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by linked user name (case-insensitive partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by linked user email
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by linked user phone number
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter by linked user gender
 *       - in: query
 *         name: emailVerified
 *         schema:
 *           type: boolean
 *         description: Filter by linked user email verification status
 *       - in: query
 *         name: phoneVerified
 *         schema:
 *           type: boolean
 *         description: Filter by linked user phone verification status
 *       - in: query
 *         name: oauthProvider
 *         schema:
 *           type: string
 *           enum: [google, facebook, apple]
 *         description: Filter by linked user OAuth provider
 *       - in: query
 *         name: gym
 *         schema:
 *           type: string
 *         description: Filter by gym ID
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filter by domain ID
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by consultant specialty (case-insensitive partial match)
 *       - in: query
 *         name: modeOfTraining
 *         schema:
 *           type: string
 *           enum: [online, offline, hybrid]
 *         description: Filter by mode of training
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by consultant verification status
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Backward-compatible alias for isVerified
 *       - in: query
 *         name: minYearsOfExperience
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 50
 *         description: Filter consultants with yearsOfExperience greater than or equal to this value
 *       - in: query
 *         name: maxYearsOfExperience
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 50
 *         description: Filter consultants with yearsOfExperience less than or equal to this value
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Consultants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       specialty:
 *                         type: string
 *                       description:
 *                         type: string
 *                       meetingLink:
 *                         type: string
 *                       yearsOfExperience:
 *                         type: integer
 *                       certifications:
 *                         type: array
 *                         items:
 *                           type: string
 *                       modeOfTraining:
 *                         type: string
 *                         enum: [online, offline, hybrid]
 *                       isVerified:
 *                         type: boolean
 *                       rating:
 *                         type: number
 *                       reviewsCount:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         description: Populated linked user document without password and OTP fields
 *                       gym:
 *                         type: object
 *                         nullable: true
 *                         description: Populated gym document
 *                       domain:
 *                         type: array
 *                         items:
 *                           type: object
 *                         description: Populated domain documents
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of consultants matching the filter
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Whether there is a next page
 *                     hasPrevPage:
 *                       type: boolean
 *                       description: Whether there is a previous page
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/", validateRequest(getConsultantsQueryDto, 'query'), getConsultants);

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
