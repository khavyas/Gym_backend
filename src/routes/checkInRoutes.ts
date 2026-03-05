import { Router } from 'express';
import {
  getCheckInQuestions,
  submitCheckIn,
  getAllResponses,
  getUserResponse,
} from '../controllers/checkInController';
import { protect, roleCheck } from '../middleware/authMiddleware';

const router = Router();

// ─────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────

// GET /api/checkin/questions
// Any logged-in user can fetch questions
router.get('/questions', protect, getCheckInQuestions);

// ─────────────────────────────────────────────
// RESPONSES
// ─────────────────────────────────────────────

// POST /api/checkin/submit
// User submits their check-in answers
router.post('/submit', protect, submitCheckIn);

// GET /api/checkin/responses
// Admin only — view all users' responses
router.get('/responses', protect, roleCheck(['admin', 'superadmin']), getAllResponses);

// GET /api/checkin/responses/:userId
// Get a specific user's response (user themselves or admin)
router.get('/responses/:userId', protect, getUserResponse);

export default router;