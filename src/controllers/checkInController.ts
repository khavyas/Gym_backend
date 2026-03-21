import { Request, Response } from 'express';
import CheckInQuestion from '../models/CheckInQuestion.model';
import CheckInResponse from '../models/CheckInResponse.model';
import { AuthRequest } from '../types/request-response.dto';
import User from '../models/User.model';
import { GetCheckInQuestionQueryDto, SubmitCheckInResponseDto } from '../types/checkIn.dto';

// ─────────────────────────────────────────────
// GET /api/checkin/questions
// Fetch all active questions grouped by domain
// Called by frontend on mount to load the check-in form
// ─────────────────────────────────────────────
export const getCheckInQuestions = async (req: AuthRequest<any,GetCheckInQuestionQueryDto>, res: Response) => {
  try {
    const questions = await CheckInQuestion.find({ isActive: true, target: req.query.target })
      .sort({ order: 1 })
      .populate('domain')
      .select('-__v');

    // Group by domainId so frontend can render domain by domain
    const grouped: Record<string, any> = {};

    questions.forEach((q) => {
      const domain = q.domain as any;
      if (!domain) return;

      const domainKey = String(domain._id);
      if (!grouped[domainKey]) {
        grouped[domainKey] = {
          id: domain.domainId,
          label: domain.domainLabel,
          icon: domain.domainIcon,
          color: domain.domainColor,
          gradientColors: domain.domainGradientColors,
          questions: [],
        };
      }

      grouped[domainKey].questions.push({
        id: q._id,
        field: q.field,
        label: q.label,
        type: q.type,
        min: q.min,
        max: q.max,
        unit: q.unit,
        lowLabel: q.lowLabel,
        highLabel: q.highLabel,
        options: q.options,
        optional: q.optional,
        invertedScore: q.invertedScore,
      });
    });

    const domains = Object.values(grouped);

    res.status(200).json({ success: true, domains });
  } catch (error) {
    console.error('Error fetching check-in questions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
};

// ─────────────────────────────────────────────
// POST /api/checkin/submit
// Save or update a user's check-in answers
// Body: { userId, answers: [{ questionId, value }, ...] }
// Upserts — so re-submitting updates existing doc
// ─────────────────────────────────────────────
export const submitCheckIn = async (req: AuthRequest<SubmitCheckInResponseDto>, res: Response) => {
  try {
    const { userId, note, answers } = req.body;

    // Validate that the userId is a valid user
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid userId' });

    // Validate that each questionId in answers exists and that the value meets the question's constraints
    const questionIds = answers.map((a: any) => a.questionId);
    const questions = await CheckInQuestion.find({ _id: { $in: questionIds } })
      .select('type min max options')
      .lean();

    const questionById = new Map<string, any>(
      questions.map((q: any) => [String(q._id), q])
    );

    // Validate each answer against its question's constraints
    const hasInvalidAnswer = answers.some((answer: any) => {
      const question = questionById.get(String(answer.questionId));
      if (!question) return true;

      if (question.type === 'number' || question.type === 'scale') {
        if (typeof answer.value !== 'number') return true;
        if (typeof question.min === 'number' && answer.value < question.min) return true;
        if (typeof question.max === 'number' && answer.value > question.max) return true;
      }

      if (question.type === 'dropdown') {
        if (typeof answer.value !== 'string') return true;
        if (Array.isArray(question.options) && !question.options.includes(answer.value)) return true;
      }

      return false;
    });

    if (hasInvalidAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in answers',
      });
    }

    // All validation passed — save the response
    const response = await CheckInResponse.create({
      userId,
      submittedBy:req.user?._id,
      note,
      answers,
      submittedAt: new Date()
    }
    );

    res.status(200).json({
      success: true,
      message: 'Check-in submitted successfully',
      response,
    });
  } catch (error) {
    console.error('Error submitting check-in:', error);
    res.status(500).json({ success: false, message: 'Failed to submit check-in' });
  }
};

// ─────────────────────────────────────────────
// GET /api/checkin/responses
// Admin only — fetch all users' responses
// Joins with questions so admin sees field labels
// ─────────────────────────────────────────────
export const getAllResponses = async (req: Request, res: Response) => {
  try {
    const responses = await CheckInResponse.find()
      .populate('userId', 'name email')  // pulls name + email from User model
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      totalResponses: responses.length,
      responses,
    });
  } catch (error) {
    console.error('Error fetching all check-in responses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch responses' });
  }
};

// ─────────────────────────────────────────────
// GET /api/checkin/responses/:userId
// Get a single user's check-in response
// Used for: user revisiting their answers
// ─────────────────────────────────────────────
export const getUserResponse = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const response = await CheckInResponse.findOne({ userId }).select('-__v');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'No check-in response found for this user',
      });
    }

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error fetching user check-in response:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch response' });
  }
};
