import { Request, Response } from 'express';
import WellnessAnswer from '../models/WellnessAnswer.model';
import User from '../models/User.model';
import { AuthRequest } from '../types/request-response.dto';

// ============================================
// SUBMIT WELLNESS ANSWERS
// ============================================
export const submitWellnessAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, answers, userRole } = req.body;

    // Validate required fields
    if (!userId || !answers || !userRole) {
      return res.status(400).json({
        success: false,
        message: 'userId, answers, and userRole are required'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify role matches
    if (user.role !== userRole && userRole !== 'user' && userRole !== 'consultant') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    // Check if wellness answers already exist for this user
    const existingAnswer = await WellnessAnswer.findOne({ userId });

    if (existingAnswer) {
      // Update existing answers
      existingAnswer.answers = new Map(Object.entries(answers));
      existingAnswer.completedAt = new Date();
      existingAnswer.userRole = userRole;
      await existingAnswer.save();

      return res.status(200).json({
        success: true,
        message: 'Wellness answers updated successfully',
        data: existingAnswer
      });
    }

    // Create new wellness answer record
    const wellnessAnswer = await WellnessAnswer.create({
      userId,
      answers: new Map(Object.entries(answers)),
      userRole,
      completedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Wellness answers submitted successfully',
      data: wellnessAnswer
    });

  } catch (error: any) {
    console.error('Submit wellness answers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting wellness answers',
      error: error.message
    });
  }
};

// ============================================
// GET WELLNESS ANSWERS FOR A USER
// ============================================
export const getWellnessAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const wellnessAnswer = await WellnessAnswer.findOne({ userId })
      .populate('userId', 'name email phone role');

    if (!wellnessAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Wellness answers not found for this user'
      });
    }

    // Convert Map to plain object for JSON response
    const answersObject = Object.fromEntries(wellnessAnswer.answers);

    return res.status(200).json({
      success: true,
      data: {
        ...wellnessAnswer.toObject(),
        answers: answersObject
      }
    });

  } catch (error: any) {
    console.error('Get wellness answers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wellness answers',
      error: error.message
    });
  }
};

// ============================================
// GET ALL WELLNESS ANSWERS (Admin/Consultant)
// ============================================
export const getAllWellnessAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (role) {
      filter.userRole = role;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const wellnessAnswers = await WellnessAnswer.find(filter)
      .populate('userId', 'name email phone role')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WellnessAnswer.countDocuments(filter);

    // Convert Map to object for each answer
    const formattedAnswers = wellnessAnswers.map(answer => ({
      ...answer.toObject(),
      answers: Object.fromEntries(answer.answers)
    }));

    return res.status(200).json({
      success: true,
      data: formattedAnswers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error: any) {
    console.error('Get all wellness answers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching all wellness answers',
      error: error.message
    });
  }
};

// ============================================
// DELETE WELLNESS ANSWERS (Optional)
// ============================================
export const deleteWellnessAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const deletedAnswer = await WellnessAnswer.findOneAndDelete({ userId });

    if (!deletedAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Wellness answers not found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Wellness answers deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete wellness answers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting wellness answers',
      error: error.message
    });
  }
};