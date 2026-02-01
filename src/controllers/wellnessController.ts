import { Request, Response } from 'express';
import WellnessQuestion from '../models/WellnessQuestion';
import WellnessResponse from '../models/WellnessResponse';

// ─────────────────────────────────────────────
// QUESTIONS — manage the question bank
// ─────────────────────────────────────────────

// GET /api/wellness/questions
// Returns all active questions, ordered by `order` field.
// This is what the frontend calls on mount to replace the hardcoded array.
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await WellnessQuestion.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v'); // hide mongoose internals from response

    res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error('Error fetching wellness questions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch questions' });
  }
};

// POST /api/wellness/questions
// Seed or add a single question. Protected — admin/superadmin only (guard in route).
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId, question, type, options, multiSelect, placeholder, order } = req.body;

    if (!questionId || !question || !type || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'questionId, question, type, and order are required',
      });
    }

    const existing = await WellnessQuestion.findOne({ questionId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Question with questionId ${questionId} already exists. Use PUT to update.`,
      });
    }

    const newQuestion = await WellnessQuestion.create({
      questionId,
      question,
      type,
      options: type === 'multiple-choice' ? options : undefined,
      multiSelect: type === 'multiple-choice' ? multiSelect : false,
      placeholder: type === 'text' ? placeholder : undefined,
      order,
      isActive: true,
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (error) {
    console.error('Error creating wellness question:', error);
    res.status(500).json({ success: false, message: 'Failed to create question' });
  }
};

// PUT /api/wellness/questions/:questionId
// Update an existing question by its questionId.
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const question = await WellnessQuestion.findOneAndUpdate(
      { questionId: Number(questionId) },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error('Error updating wellness question:', error);
    res.status(500).json({ success: false, message: 'Failed to update question' });
  }
};

// DELETE /api/wellness/questions/:questionId
// Soft-delete: sets isActive = false so old responses still reference a valid question.
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await WellnessQuestion.findOneAndUpdate(
      { questionId: Number(questionId) },
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, message: 'Question deactivated', question });
  } catch (error) {
    console.error('Error deleting wellness question:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate question' });
  }
};

// ─────────────────────────────────────────────
// RESPONSES — track user/consultant answers
// ─────────────────────────────────────────────

// POST /api/wellness/submit
// Receives the full answers object from frontend: { "1": "answer", "2": ["a","b"], ... }
// Upserts one WellnessResponse doc per questionId for this user.
export const submitResponses = async (req: Request, res: Response) => {
  try {
    const { userId, userRole, answers } = req.body;

    if (!userId || !userRole || !answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'userId, userRole, and answers are required',
      });
    }

    // Build upsert operations — one per question answered
    const upsertPromises = Object.entries(answers).map(([questionId, answer]) =>
      WellnessResponse.findOneAndUpdate(
        { userId, questionId: Number(questionId) },   // match existing response
        {
          $set: {
            userId,
            userRole,
            questionId: Number(questionId),
            answer,
            submittedAt: new Date(),
          },
        },
        { upsert: true, new: true } // create if not exists, update if exists
      )
    );

    const results = await Promise.all(upsertPromises);

    res.status(200).json({
      success: true,
      message: 'Wellness responses saved successfully',
      savedCount: results.length,
    });
  } catch (error) {
    console.error('Error submitting wellness responses:', error);
    res.status(500).json({ success: false, message: 'Failed to save responses' });
  }
};

// GET /api/wellness/responses/:userId
// Retrieve all saved responses for a specific user.
// Useful for: revisiting answers, showing a summary, or admin viewing a user's data.
export const getResponses = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const responses = await WellnessResponse.find({ userId })
      .sort({ questionId: 1 })
      .select('-__v');

    // Reshape into the same format the frontend sends: { questionId: answer, ... }
    const answersMap: Record<number, string | string[]> = {};
    responses.forEach((r) => {
      answersMap[r.questionId] = r.answer;
    });

    res.status(200).json({
      success: true,
      userId,
      answers: answersMap,
      totalResponses: responses.length,
    });
  } catch (error) {
    console.error('Error fetching wellness responses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch responses' });
  }
};

// GET /api/wellness/responses/question/:questionId
// Get all users' responses for a single question.
// Useful for: admin analytics / dashboards.
export const getResponsesByQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const responses = await WellnessResponse.find({ questionId: Number(questionId) })
      .select('userId userRole answer submittedAt');

    res.status(200).json({
      success: true,
      questionId: Number(questionId),
      responses,
      totalResponses: responses.length,
    });
  } catch (error) {
    console.error('Error fetching responses by question:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch responses' });
  }
};