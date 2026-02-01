import { Router } from 'express';
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submitResponses,
  getResponses,
  getResponsesByQuestion,
} from '../controllers/wellnessController';
import { protect, roleCheck } from '../middleware/authMiddleware';
const router = Router();

// ─────────────────────────────────────────────
// QUESTIONS (the question bank)
// ─────// Questions
router.get('/questions', protect, getQuestions);

router.post('/questions', protect, roleCheck(['admin', 'superadmin']), createQuestion);
router.put('/questions/:questionId', protect, roleCheck(['admin', 'superadmin']), updateQuestion);
router.delete('/questions/:questionId', protect, roleCheck(['admin', 'superadmin']), deleteQuestion);

// Responses
router.post('/submit', protect, submitResponses);
router.get('/responses/:userId', protect, getResponses);
router.get('/responses/question/:questionId', protect, roleCheck(['admin', 'superadmin']), getResponsesByQuestion);
export default router;