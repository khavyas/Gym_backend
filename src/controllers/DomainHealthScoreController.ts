import { Response } from 'express';
import Consultant from '../models/Consultant.model';
import DomainHealthScore from '../models/DomainHealthScores.model';
import { AuthRequest } from '../types/request-response.dto';

export const getDHI = async (req: AuthRequest, res: Response) => {
  try {
    const consultant = await Consultant.findOne({ user: req.user._id })
      .select('domain')
      .lean();

    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found',
      });
    }

    const consultantDomainIds = consultant.domain || [];

    if (consultantDomainIds.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        dhi: [],
      });
    }

    const latestRedScores = await DomainHealthScore.aggregate([
      {
        $match: {
          domain: { $in: consultantDomainIds },
        },
      },
      {
        $sort: {
          userId: 1,
          domain: 1,
          calculatedAt: -1,
          createdAt: -1,
          _id: -1,
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            domain: '$domain',
          },
          latestScoreId: { $first: '$_id' },
          latestStatus: { $first: '$status' },
        },
      },
      {
        $match: {
          latestStatus: 'red',
        },
      },
      {
        $project: {
          _id: 0,
          latestScoreId: 1,
        },
      },
    ]);

    const latestRedScoreIds = latestRedScores.map((score) => score.latestScoreId);

    if (latestRedScoreIds.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        dhi: [],
      });
    }

    const dhi = await DomainHealthScore.find({ _id: { $in: latestRedScoreIds } })
      .populate('userId', 'name email phone role')
      .populate('domain')
      .populate('metrics.questionId')
      .sort({ calculatedAt: -1, createdAt: -1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      total: dhi.length,
      dhi,
    });
  } catch (error) {
    console.error('Error fetching consultant DHI:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch DHI',
    });
  }
};
