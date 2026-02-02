import { Request, Response } from 'express';
import User from '../models/User.model';
import { calculateNextPeriod, analyzeCycleRegularity } from '../utils/menstrualCycleHelpers';

// Extend Request type to include user (from auth middleware)
interface AuthRequest extends Request {
  user?: {
    _id: any;
    role: string;
    email?: string;
    name?: string;
  };
}

// Enable menstrual cycle tracking
export const enableTracking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.gender !== 'female') {
      return res.status(400).json({ 
        success: false, 
        message: 'Menstrual cycle tracking is only available for female users' 
      });
    }
    
    // ✅ Initialize menstrual cycle tracking with proper typing
    user.menstrualCycle = {
      isTracking: true,
      averageCycleLength: Number(req.body.averageCycleLength) || 28,
      averagePeriodLength: Number(req.body.averagePeriodLength) || 5,
      cycleHistory: [] as any, // ✅ Type assertion for empty array
      notifications: {
        periodReminder: true,
        fertileWindowReminder: false,
        daysBeforeReminder: 2
      },
      cycleRegularity: 'unknown',
      lastUpdated: new Date()
    } as any; // ✅ Type assertion for the whole object
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Menstrual cycle tracking enabled successfully',
      data: user.menstrualCycle
    });
  } catch (error) {
    console.error('Error enabling tracking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Log a new period
export const logPeriod = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { startDate, endDate, symptoms, flowIntensity, notes } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user || !user.menstrualCycle?.isTracking) {
      return res.status(400).json({ 
        success: false, 
        message: 'Menstrual cycle tracking is not enabled' 
      });
    }
    
    const periodStart = new Date(startDate);
    const periodEnd = endDate ? new Date(endDate) : null;
    
    // Calculate period length
    let periodLength: number | null = null;
    if (periodEnd) {
      const timeDiff = periodEnd.getTime() - periodStart.getTime();
      periodLength = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    // Calculate cycle length
    let cycleLength: number | null = null;
    if (user.menstrualCycle.lastPeriodStartDate) {
      const timeDiff = periodStart.getTime() - new Date(user.menstrualCycle.lastPeriodStartDate).getTime();
      cycleLength = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    // ✅ Create new cycle entry
    const newCycle = {
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      cycleLength,
      periodLength,
      symptoms: symptoms || [],
      flowIntensity: flowIntensity || [],
      notes: notes || ''
    };
    
    // ✅ Initialize cycleHistory if it doesn't exist
    if (!user.menstrualCycle.cycleHistory) {
      user.menstrualCycle.cycleHistory = [] as any;
    }
    
    // ✅ Push the new cycle
    (user.menstrualCycle.cycleHistory as any).push(newCycle);
    
    // Keep only last 12 cycles
    if (user.menstrualCycle.cycleHistory.length > 12) {
      user.menstrualCycle.cycleHistory = (user.menstrualCycle.cycleHistory as any).slice(-12);
    }
    
    // Update last period dates
    user.menstrualCycle.lastPeriodStartDate = periodStart;
    user.menstrualCycle.lastPeriodEndDate = periodEnd;
    
    // ✅ Calculate predictions with type assertion
    const predictions = calculateNextPeriod(user.menstrualCycle as any);
    user.menstrualCycle.nextPeriodDate = predictions.nextPeriodDate;
    user.menstrualCycle.fertileWindowStart = predictions.fertileWindowStart;
    user.menstrualCycle.fertileWindowEnd = predictions.fertileWindowEnd;
    user.menstrualCycle.ovulationDate = predictions.ovulationDate;
    
    // ✅ Analyze cycle regularity with type assertion
    user.menstrualCycle.cycleRegularity = analyzeCycleRegularity(user.menstrualCycle.cycleHistory as any);
    
    user.menstrualCycle.lastUpdated = new Date();
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Period logged successfully',
      data: {
        cycle: newCycle,
        predictions: {
          nextPeriodDate: user.menstrualCycle.nextPeriodDate,
          fertileWindow: {
            start: user.menstrualCycle.fertileWindowStart,
            end: user.menstrualCycle.fertileWindowEnd
          },
          ovulationDate: user.menstrualCycle.ovulationDate
        },
        cycleRegularity: user.menstrualCycle.cycleRegularity
      }
    });
  } catch (error) {
    console.error('Error logging period:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get cycle insights
export const getCycleInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findById(userId).select('menstrualCycle gender');
    
    if (!user || !user.menstrualCycle?.isTracking) {
      return res.status(400).json({ 
        success: false, 
        message: 'Menstrual cycle tracking is not enabled' 
      });
    }
    
    const { menstrualCycle } = user;
    
    // Calculate days until next period
    let daysUntilNextPeriod: number | null = null;
    if (menstrualCycle.nextPeriodDate) {
      const timeDiff = new Date(menstrualCycle.nextPeriodDate).getTime() - Date.now();
      daysUntilNextPeriod = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    // Get average cycle length from history
    const cycleLengths = (menstrualCycle.cycleHistory || [])
      .map((c: any) => c.cycleLength)
      .filter((l: any): l is number => typeof l === 'number' && l > 0);
    
    const averageCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a: number, b: number) => a + b, 0) / cycleLengths.length)
      : Number(menstrualCycle.averageCycleLength) || 28;
    
    // Common symptoms analysis
    const allSymptoms = (menstrualCycle.cycleHistory || []).flatMap((c: any) => c.symptoms || []);
    const symptomCounts = allSymptoms.reduce((acc: any, s: any) => {
      const symptomType = s.type || 'unknown';
      acc[symptomType] = (acc[symptomType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    res.status(200).json({
      success: true,
      data: {
        nextPeriodDate: menstrualCycle.nextPeriodDate,
        daysUntilNextPeriod,
        fertileWindow: {
          start: menstrualCycle.fertileWindowStart,
          end: menstrualCycle.fertileWindowEnd,
          ovulationDate: menstrualCycle.ovulationDate
        },
        cycleStats: {
          averageCycleLength,
          averagePeriodLength: Number(menstrualCycle.averagePeriodLength) || 5,
          cycleRegularity: menstrualCycle.cycleRegularity,
          totalCyclesTracked: menstrualCycle.cycleHistory?.length || 0
        },
        commonSymptoms: Object.entries(symptomCounts)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([symptom, count]) => ({ symptom, occurrences: count })),
        lastPeriod: {
          startDate: menstrualCycle.lastPeriodStartDate,
          endDate: menstrualCycle.lastPeriodEndDate
        }
      }
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update notification settings
export const updateNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { periodReminder, fertileWindowReminder, daysBeforeReminder } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user || !user.menstrualCycle?.isTracking) {
      return res.status(400).json({ 
        success: false, 
        message: 'Menstrual cycle tracking is not enabled' 
      });
    }
    
    if (!user.menstrualCycle.notifications) {
      user.menstrualCycle.notifications = {
        periodReminder: true,
        fertileWindowReminder: false,
        daysBeforeReminder: 2
      };
    }
    
    user.menstrualCycle.notifications = {
      periodReminder: periodReminder ?? user.menstrualCycle.notifications.periodReminder,
      fertileWindowReminder: fertileWindowReminder ?? user.menstrualCycle.notifications.fertileWindowReminder,
      daysBeforeReminder: Number(daysBeforeReminder) ?? user.menstrualCycle.notifications.daysBeforeReminder
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification settings updated',
      data: user.menstrualCycle.notifications
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Disable tracking
export const disableTracking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.menstrualCycle) {
      user.menstrualCycle.isTracking = false;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Menstrual cycle tracking disabled'
    });
  } catch (error) {
    console.error('Error disabling tracking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};