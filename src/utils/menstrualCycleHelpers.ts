import { Types } from 'mongoose';

// ✅ Use 'any' to accept Mongoose document types
interface CycleHistoryItem {
  periodStartDate: Date;
  periodEndDate?: Date | null;
  cycleLength?: number | null;
  periodLength?: number | null;
  symptoms?: any[]; // ✅ Changed to any[] to accept Mongoose DocumentArray
  flowIntensity?: any[]; // ✅ Changed to any[]
  notes?: string;
}

interface MenstrualCycleData {
  isTracking?: boolean;
  averageCycleLength?: number;
  averagePeriodLength?: number;
  lastPeriodStartDate?: Date;
  lastPeriodEndDate?: Date;
  cycleHistory?: any[]; // ✅ Changed to any[] to accept Mongoose DocumentArray
  nextPeriodDate?: Date | null;
  fertileWindowStart?: Date | null;
  fertileWindowEnd?: Date | null;
  ovulationDate?: Date | null;
  notifications?: {
    periodReminder?: boolean;
    fertileWindowReminder?: boolean;
    daysBeforeReminder?: number;
  };
  cycleRegularity?: 'regular' | 'irregular' | 'unknown';
  lastUpdated?: Date;
}

// Calculate next period and fertile window
export const calculateNextPeriod = (menstrualCycle: MenstrualCycleData) => {
  const { lastPeriodStartDate, cycleHistory = [], averageCycleLength = 28 } = menstrualCycle;
  
  if (!lastPeriodStartDate) {
    return {
      nextPeriodDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      ovulationDate: null
    };
  }
  
  // Use recent cycle lengths to predict, or fall back to average
  const recentCycles = (cycleHistory as CycleHistoryItem[])
    .slice(-3)
    .map(c => c.cycleLength)
    .filter((length): length is number => typeof length === 'number' && length > 0);
  
  const predictedCycleLength = recentCycles.length > 0
    ? Math.round(recentCycles.reduce((a, b) => a + b, 0) / recentCycles.length)
    : averageCycleLength;
  
  const nextPeriodDate = new Date(lastPeriodStartDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + predictedCycleLength);
  
  // Ovulation typically occurs 14 days before next period
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14);
  
  // Fertile window: 5 days before ovulation to 1 day after
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
  
  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);
  
  return {
    nextPeriodDate,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate
  };
};

// Analyze if cycles are regular
export const analyzeCycleRegularity = (
  cycleHistory: any[] = []
): 'regular' | 'irregular' | 'unknown' => {
  if (!cycleHistory || cycleHistory.length < 3) {
    return 'unknown';
  }
  
  const cycleLengths = (cycleHistory as CycleHistoryItem[])
    .map(c => c.cycleLength)
    .filter((length): length is number => typeof length === 'number' && length > 0);
  
  if (cycleLengths.length < 3) {
    return 'unknown';
  }
  
  const average = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const variance = cycleLengths.reduce(
    (sum, length) => sum + Math.pow(length - average, 2), 
    0
  ) / cycleLengths.length;
  const standardDeviation = Math.sqrt(variance);
  
  // If standard deviation is less than 3 days, consider it regular
  return standardDeviation < 3 ? 'regular' : 'irregular';
};

// Calculate current cycle phase
export const getCurrentPhase = (menstrualCycle: MenstrualCycleData) => {
  const { 
    lastPeriodStartDate, 
    averageCycleLength = 28, 
    averagePeriodLength = 5 
  } = menstrualCycle;
  
  if (!lastPeriodStartDate) {
    return 'unknown';
  }
  
  const daysSinceLastPeriod = Math.floor(
    (Date.now() - new Date(lastPeriodStartDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastPeriod <= averagePeriodLength) {
    return 'menstrual';
  } else if (daysSinceLastPeriod <= averageCycleLength / 2) {
    return 'follicular';
  } else if (daysSinceLastPeriod <= (averageCycleLength / 2) + 3) {
    return 'ovulation';
  } else {
    return 'luteal';
  }
};