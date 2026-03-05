import mongoose from 'mongoose';
import CheckInQuestion from '../models/CheckInQuestion.model';

// await mongoose.connect(process.env.MONGO_URI!);


// Pasted directly from checkinQuestions.ts
const CHECKIN_DOMAINS = [
  {
    id: 'physical',
    label: 'Physical',
    icon: '🏃',
    color: '#FF6B6B',
    gradientColors: ['#FF6B6B', '#FF8E53'] as [string, string],
    questions: [
      { field: 'physical_weight', label: 'Weight & Measurements: What is your current weight?', type: 'number', min: 30, max: 300, unit: 'kg' },
      { field: 'physical_steps', label: 'Daily Walking Steps: How many steps do you walk daily on average?', type: 'number', min: 0, max: 50000, unit: 'steps' },
      { field: 'physical_activity', label: 'Activity Level: How many times per week do you exercise?', type: 'number', min: 0, max: 14, unit: 'sessions' },
      { field: 'physical_rhr', label: 'Vital Signs: What is your typical resting heart rate?', type: 'number', min: 30, max: 200, unit: 'bpm', invertedScore: true },
      { field: 'physical_energy', label: 'Vitality: On a scale of 1–10, how would you rate your overall energy level?', type: 'scale', min: 1, max: 10, lowLabel: 'Very Low', highLabel: 'Excellent' },
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: '🥗',
    color: '#4ADE80',
    gradientColors: ['#4ADE80', '#22D3EE'] as [string, string],
    questions: [
      { field: 'nutrition_diet', label: 'Dietary Adherence: Do you follow any healthy dietary plan?', type: 'dropdown', options: ['Yes', 'No', 'Sometimes'] },
      { field: 'nutrition_junk', label: 'Intake Frequency: How many times per week do you eat junk/processed food?', type: 'number', min: 0, max: 21, unit: 'times', invertedScore: true },
      { field: 'nutrition_water', label: 'Hydration: How many litres of water do you drink daily?', type: 'number', min: 0, max: 10, unit: 'litres' },
      { field: 'nutrition_digestion', label: 'Digestive Health: On a scale of 1–10 rate digestive comfort', type: 'scale', min: 1, max: 10, lowLabel: 'Very Poor', highLabel: 'Excellent' },
    ],
  },
  {
    id: 'mental',
    label: 'Mental',
    icon: '🧠',
    color: '#A78BFA',
    gradientColors: ['#A78BFA', '#EC4899'] as [string, string],
    questions: [
      { field: 'mental_stress', label: 'Stress & Mood: On a scale of 1–10 rate your stress level', type: 'scale', min: 1, max: 10, lowLabel: 'Very Low', highLabel: 'Extreme', invertedScore: true },
      { field: 'mental_irritability', label: 'Behavioral Markers: How frequently do you experience irritability?', type: 'number', min: 0, max: 20, unit: 'times', invertedScore: true },
      { field: 'mental_meditation', label: 'Resilience: How many times per week do you practice meditation or mindfulness?', type: 'number', min: 0, max: 7, unit: 'days' },
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: '🌙',
    color: '#38BDF8',
    gradientColors: ['#1E3A5F', '#38BDF8'] as [string, string],
    questions: [
      { field: 'sleep_hours', label: 'Sleep Patterns: How many hours of sleep do you get per night?', type: 'number', min: 0, max: 12, unit: 'hrs' },
      { field: 'sleep_bedtime', label: 'Bedtime: Do you maintain a consistent bedtime?', type: 'yesno' },
      { field: 'sleep_quality', label: 'Sleep Quality: On a scale of 1–10 how would you rate your sleep quality?', type: 'scale', min: 1, max: 10, lowLabel: 'Very Poor', highLabel: 'Excellent' },
    ],
  },
  {
    id: 'reproductive',
    label: 'Reproductive',
    icon: '🌸',
    color: '#F472B6',
    gradientColors: ['#F472B6', '#FB7185'] as [string, string],
    questions: [
      { field: 'repro_libido', label: 'Function & Drive: How would you rate your libido?', type: 'scale', min: 1, max: 10, lowLabel: 'Very Low', highLabel: 'Normal' },
      { field: 'repro_hormonal', label: 'Symptom Tracking: Rate hormonal symptoms such as mood swings or fatigue', type: 'scale', min: 1, max: 10, lowLabel: 'None', highLabel: 'Severe', invertedScore: true },
      { field: 'repro_cycle', label: 'Cyclical Health: Is your menstrual cycle regular?', type: 'yesno', optional: true },
    ],
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: '💰',
    color: '#FBBF24',
    gradientColors: ['#FBBF24', '#F59E0B'] as [string, string],
    questions: [
      { field: 'finance_savings', label: 'Savings: What percentage of your income do you save?', type: 'number', min: 0, max: 100, unit: '%' },
      { field: 'finance_emergency', label: 'Security: How many months could your emergency savings support you?', type: 'number', min: 0, max: 60, unit: 'months' },
      { field: 'finance_stress', label: 'Financial Stress: Rate your financial stress level', type: 'scale', min: 1, max: 10, lowLabel: 'None', highLabel: 'Extreme', invertedScore: true },
    ],
  },
  {
    id: 'tech',
    label: 'Tech & Digital',
    icon: '📱',
    color: '#34D399',
    gradientColors: ['#34D399', '#059669'] as [string, string],
    questions: [
      { field: 'tech_screentime', label: 'Screen Time: What is your average daily screen time?', type: 'number', min: 0, max: 24, unit: 'hrs', invertedScore: true },
      { field: 'tech_social', label: 'Social Media: How many hours do you spend on social media daily?', type: 'number', min: 0, max: 24, unit: 'hrs', invertedScore: true },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: '🤝',
    color: '#60A5FA',
    gradientColors: ['#60A5FA', '#3B82F6'] as [string, string],
    questions: [
      { field: 'social_interactions', label: 'Connection: How many meaningful social interactions did you have this week?', type: 'number', min: 0, max: 50, unit: 'times' },
      { field: 'social_conflict', label: 'Struggles: How frequently do you experience conflict in relationships?', type: 'scale', min: 1, max: 10, lowLabel: 'Never', highLabel: 'Very Often', invertedScore: true },
    ],
  },
  {
    id: 'occupational',
    label: 'Work',
    icon: '💼',
    color: '#FB923C',
    gradientColors: ['#FB923C', '#EF4444'] as [string, string],
    questions: [
      { field: 'work_hours', label: 'Workload: How many hours do you work daily?', type: 'number', min: 0, max: 24, unit: 'hrs' },
      { field: 'work_breaks', label: 'Breaktime: How frequently do you take breaks?', type: 'dropdown', options: ['Once every 20 minutes', 'Once every hour', 'Rarely', 'Almost never'] },
      { field: 'work_satisfaction', label: 'Satisfaction: Rate your job satisfaction and work-life balance', type: 'scale', min: 1, max: 10 },
      { field: 'work_stress', label: 'Strain: Rate work-related stress or physical strain', type: 'scale', min: 1, max: 10, invertedScore: true },
    ],
  },
];


async function seedCheckInQuestions() {
  try {
    // await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions
    await CheckInQuestion.deleteMany({});
    console.log('🗑️  Cleared existing CheckInQuestions');

    const docs: any[] = [];
    let order = 0;

for (const domain of CHECKIN_DOMAINS) {
  for (const q of domain.questions) {
    const question = q as {
      field: string;
      label: string;
      type: string;
      min?: number;
      max?: number;
      unit?: string;
      lowLabel?: string;
      highLabel?: string;
      options?: string[];
      optional?: boolean;
      invertedScore?: boolean;
    };

    docs.push({
      field:                question.field,
      label:                question.label,
      type:                 question.type,
      domainId:             domain.id,
      domainLabel:          domain.label,
      domainIcon:           domain.icon,
      domainColor:          domain.color,
      domainGradientColors: domain.gradientColors,
      min:                  question.min,
      max:                  question.max,
      unit:                 question.unit,
      lowLabel:             question.lowLabel,
      highLabel:            question.highLabel,
      options:              question.options,
      optional:             question.optional ?? false,
      invertedScore:        question.invertedScore ?? false,
      order:                order++,
      isActive:             true,
    });
  }
}
    await CheckInQuestion.insertMany(docs);
    console.log(`🌱 Seeded ${docs.length} CheckIn questions successfully`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedCheckInQuestions();