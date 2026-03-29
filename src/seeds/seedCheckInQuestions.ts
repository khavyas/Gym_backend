import mongoose from 'mongoose';
import CheckInQuestion from '../models/CheckInQuestion.model';
import Domain from '../models/Domain.model';

// await mongoose.connect(process.env.MONGO_URI!);


// Questions reduced to the 24 Pilot Demo questions as per Finalised_questions_for_Demo.pdf
// Mapped to coordinator fields from Hiwox Wellness Master Logic Excel
const CHECKIN_DOMAINS = [
  {
    id: 'physical',
    label: 'Physical',
    icon: '🏃',
    color: '#FF6B6B',
    gradientColors: ['#FF6B6B', '#FF8E53'] as [string, string],
    questions: [
      // Q1 – Movement: Daily Steps
      {
        field: 'physical_daily_steps_coordinator',
        label: 'Daily Steps: How many steps did you take today?',
        type: 'number',
        target: 'coordinator',
        min: 0,
        max: 50000,
        unit: 'steps',
        weight: 0.05,
        threshold: [
          { min_value: 0, max_value: 3999, label: 'red' },
          { min_value: 4000, max_value: 7500, label: 'yellow' },
          { min_value: 7501, max_value: 50000, label: 'green' },
        ],
      },
      // Q2 – Recovery: Restful Sleep Hours
      {
        field: 'physical_restful_sleep_hours_coordinator',
        label: 'Restful Sleep (Hours): How many hours of restful sleep did you get last night?',
        type: 'number',
        target: 'coordinator',
        min: 0,
        max: 24,
        unit: 'hours',
        weight: 0.06,
        threshold: [
          { min_value: 0, max_value: 5.49, label: 'red' },
          { min_value: 5.5, max_value: 7, label: 'yellow' },
          { min_value: 7.01, max_value: 24, label: 'green' },
        ],
      },
      // Q3 – Energy: Physical Energy Scale
      {
        field: 'physical_energy_coordinator',
        label: 'Physical Energy: On a scale of 1–10, how would you rate your overall physical energy level today?',
        type: 'scale',
        target: 'coordinator',
        min: 1,
        max: 10,
        lowLabel: 'Low',
        highLabel: 'High',
        weight: 0.04,
        threshold: [
          { min_value: 1, max_value: 3, label: 'red' },
          { min_value: 4, max_value: 6, label: 'yellow' },
          { min_value: 7, max_value: 10, label: 'green' },
        ],
      },
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: '🥗',
    color: '#4ADE80',
    gradientColors: ['#4ADE80', '#22D3EE'] as [string, string],
    questions: [
      // Q4 – Hydration: Water Intake
      {
        field: 'nutrition_hydration_liters_coordinator',
        label: 'Hydration (Liters): Approximately how many liters of water have you consumed today?',
        type: 'number',
        target: 'coordinator',
        min: 0,
        max: 10,
        unit: 'liters',
        weight: 0.05,
        threshold: [
          { min_value: 0, max_value: 0.99, label: 'red' },
          { min_value: 1.0, max_value: 2.0, label: 'yellow' },
          { min_value: 2.01, max_value: 10, label: 'green' },
        ],
      },
      // Q5 – Quality: Whole vs Processed Foods
      {
        field: 'nutrition_whole_vs_processed_foods_coordinator',
        label: 'Whole vs Processed Foods: Did your meals today consist mostly of whole foods or processed/packaged foods?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.04,
      },
      // Q6 – Sugar: High Added Sugar Intake
      {
        field: 'nutrition_high_added_sugar_intake_coordinator',
        label: 'High Added Sugar Intake: Did you consume any meals or beverages with high amounts of added sugar today?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.04,
        invertedScore: true,
      },
    ],
  },
  {
    id: 'mental',
    label: 'Mental',
    icon: '🧠',
    color: '#A78BFA',
    gradientColors: ['#A78BFA', '#EC4899'] as [string, string],
    questions: [
      // Q7 – Bandwidth: Focus & Mental Bandwidth
      {
        field: 'mental_focus_bandwidth_coordinator',
        label: 'Focus & Bandwidth: On a scale of 1–10, how would you rate your current ability to focus on complex tasks?',
        type: 'scale',
        target: 'coordinator',
        min: 1,
        max: 10,
        lowLabel: 'Low',
        highLabel: 'High',
        weight: 0.04,
        threshold: [
          { min_value: 1, max_value: 3, label: 'red' },
          { min_value: 4, max_value: 6, label: 'yellow' },
          { min_value: 7, max_value: 10, label: 'green' },
        ],
      },
      // Q8 – Overload: Mentally Overwhelmed
      {
        field: 'mental_overwhelmed_coordinator',
        label: 'Mentally Overwhelmed: Have you felt mentally overwhelmed by your daily tasks in the past 24 hours?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.05,
        invertedScore: true,
      },
      // Q9 – Stimulation: Mentally Engaging Activity
      {
        field: 'mental_engaging_activity_coordinator',
        label: 'Mentally Engaging Activity: Did you engage in any activity today that felt mentally engaging or challenging?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.02,
      },
      // Q10 – State: Overall Mood/State (Emotional)
      {
        field: 'emotional_overall_mood_state_coordinator',
        label: 'Overall Mood/State: On a scale of 1–10, how would you rate your overall mood today?',
        type: 'scale',
        target: 'coordinator',
        min: 1,
        max: 10,
        lowLabel: 'Low',
        highLabel: 'High',
        weight: 0.05,
        threshold: [
          { min_value: 1, max_value: 3, label: 'red' },
          { min_value: 4, max_value: 6, label: 'yellow' },
          { min_value: 7, max_value: 10, label: 'green' },
        ],
      },
      // Q11 – Friction: Extended Frustration (Emotional)
      {
        field: 'emotional_extended_frustration_coordinator',
        label: 'Extended Frustration: Have you experienced extended periods of frustration or irritability today?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.04,
        invertedScore: true,
      },
      // Q12 – Decompression: Intentional Decompression (Emotional)
      {
        field: 'emotional_intentional_decompression_coordinator',
        label: 'Intentional Decompression: Did you take any intentional time today just to relax and reset?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.02,
      },
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: '🌙',
    color: '#38BDF8',
    gradientColors: ['#1E3A5F', '#38BDF8'] as [string, string],
    questions: [
      // Sleep domain has no standalone coordinator questions in the 24-question demo set.
      // Sleep is captured via Q2 (physical_restful_sleep_hours_coordinator) in Physical domain.
    ],
  },
  {
    id: 'reproductive',
    label: 'Reproductive',
    icon: '🌸',
    color: '#F472B6',
    gradientColors: ['#F472B6', '#FB7185'] as [string, string],
    questions: [
      // Q23 – Drive: Physical Drive / Vitality
      {
        field: 'vitality_physical_drive_coordinator',
        label: 'Physical Drive/Vitality: On a scale of 1–10, how would you rate your baseline physical drive and vitality lately?',
        type: 'scale',
        target: 'coordinator',
        min: 1,
        max: 10,
        lowLabel: 'Low',
        highLabel: 'High',
        weight: 0.06,
        threshold: [
          { min_value: 1, max_value: 3, label: 'red' },
          { min_value: 4, max_value: 6, label: 'yellow' },
          { min_value: 7, max_value: 10, label: 'green' },
        ],
      },
      // Q24 – Intimacy: Intimacy Satisfaction
      {
        field: 'vitality_intimacy_satisfaction_coordinator',
        label: 'Intimacy Satisfaction: Do you feel satisfied with your current level of personal connection and intimacy?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.04,
      },
    ],
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: '💰',
    color: '#FBBF24',
    gradientColors: ['#FBBF24', '#F59E0B'] as [string, string],
    questions: [
      // Q16 – Control: Spending Comfort
      {
        field: 'financial_spending_comfort_coordinator',
        label: 'Spending Comfort: Do you currently feel comfortable with your daily spending habits?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.03,
      },
      // Q17 – Anxiety: Financial Stress / Anxiety
      {
        field: 'financial_stress_anxiety_coordinator',
        label: 'Financial Stress/Anxiety: On a scale of 1–10, how much stress does thinking about your finances cause you?',
        type: 'scale',
        target: 'coordinator',
        min: 1,
        max: 10,
        lowLabel: 'Low',
        highLabel: 'High',
        weight: 0.05,
        threshold: [
          { min_value: 1, max_value: 3, label: 'green' },
          { min_value: 4, max_value: 6, label: 'yellow' },
          { min_value: 7, max_value: 10, label: 'red' },
        ],
        invertedScore: true,
      },
      // Q18 – Clarity: Budget Clarity
      {
        field: 'financial_budget_clarity_coordinator',
        label: 'Budget Clarity: Do you feel you have a clear understanding of your budget for this current month?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.02,
      },
    ],
  },
  {
    id: 'tech',
    label: 'Tech & Digital',
    icon: '📱',
    color: '#34D399',
    gradientColors: ['#34D399', '#059669'] as [string, string],
    questions: [
      // Q21 – Saturation: Non-Work Screen Time
      {
        field: 'digital_non_work_screen_time_coordinator',
        label: 'Non-Work Screen Time (Hrs): Roughly how many hours of non-work screen time (social media, browsing) did you have today?',
        type: 'number',
        target: 'coordinator',
        min: 0,
        max: 24,
        unit: 'hours',
        weight: 0.04,
        threshold: [
          { min_value: 0, max_value: 1.99, label: 'green' },
          { min_value: 2, max_value: 4, label: 'yellow' },
          { min_value: 4.01, max_value: 24, label: 'red' },
        ],
        invertedScore: true,
      },
      // Q22 – Distraction: Device Distraction
      {
        field: 'digital_device_distraction_coordinator',
        label: 'Device Distraction: Do you feel your device usage frequently distracts you from being present in the moment?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.05,
        invertedScore: true,
      },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: '🤝',
    color: '#60A5FA',
    gradientColors: ['#60A5FA', '#3B82F6'] as [string, string],
    questions: [
      // Q19 – Connection: Meaningful Connection
      {
        field: 'social_meaningful_connection_coordinator',
        label: 'Meaningful Connection: Have you had a meaningful, non-work-related conversation with someone today?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.04,
      },
      // Q20 – Support: Reliable Support System
      {
        field: 'social_reliable_support_system_coordinator',
        label: 'Reliable Support System: Do you feel you have a reliable person to reach out to if you need personal support?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.05,
      },
    ],
  },
  {
    id: 'occupational',
    label: 'Work',
    icon: '💼',
    color: '#FB923C',
    gradientColors: ['#FB923C', '#EF4444'] as [string, string],
    questions: [
      // Q13 – Progress: Sense of Progress
      {
        field: 'occupational_sense_of_progress_coordinator',
        label: 'Sense of Progress: Did you feel a sense of accomplishment or forward momentum in your work today?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.03,
      },
      // Q14 – Boundaries: Work/Life Boundaries
      {
        field: 'occupational_work_life_boundaries_coordinator',
        label: 'Work/Life Boundaries: Were you able to clearly separate your work hours from your personal downtime?',
        type: 'dropdown',
        options: ['yes', 'no'],
        target: 'coordinator',
        weight: 0.04,
      },
      // Q15 – Alignment: Role Alignment
      {
        field: 'occupational_role_alignment_coordinator',
        label: 'Role Alignment: On a scale of 1–10, how aligned do you feel with your current daily responsibilities?',
        type: 'scale',
        target: 'coordinator',
        min: 1,
        max: 10,
        lowLabel: 'Low',
        highLabel: 'High',
        weight: 0.05,
        threshold: [
          { min_value: 1, max_value: 3, label: 'red' },
          { min_value: 4, max_value: 6, label: 'yellow' },
          { min_value: 7, max_value: 10, label: 'green' },
        ],
      },
    ],
  },
];


export default async function seedCheckInQuestions() {
  try {
    // await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing domains + questions
    await CheckInQuestion.deleteMany({});
    console.log('🗑️  Cleared existing CheckInQuestions');
    await Domain.deleteMany({});
    console.log('🗑️  Cleared existing Domains');

    const domainDocs = await Domain.insertMany(
      CHECKIN_DOMAINS.map((domain) => ({
        domainId: domain.id,
        domainLabel: domain.label,
        domainIcon: domain.icon,
        domainColor: domain.color,
        domainGradientColors: domain.gradientColors,
      }))
    );

    const domainById = new Map(domainDocs.map((d) => [d.domainId, d]));

    const docs: any[] = [];
    let order = 0;

    for (const domain of CHECKIN_DOMAINS) {
      for (const q of domain.questions) {
        const domainDoc = domainById.get(domain.id);
        if (!domainDoc) {
          throw new Error(`Missing domain for id: ${domain.id}`);
        }

        const question = q as {
          field: string;
          label: string;
          type: string;
          target: 'coordinator' | 'user';
          min?: number;
          max?: number;
          unit?: string;
          lowLabel?: string;
          highLabel?: string;
          options?: string[];
          optional?: boolean;
          invertedScore?: boolean;
          weight?: number;
          threshold?: { min_value: number; max_value: number; label: 'red' | 'yellow' | 'green' }[];
        };

        docs.push({
          field: question.field,
          label: question.label,
          type: question.type,
          target: question.target ?? 'coordinator',
          domain: domainDoc._id,
          weight: question.weight ?? 1,
          min: question.min,
          max: question.max,
          threshold: question.threshold,
          unit: question.unit,
          lowLabel: question.lowLabel,
          highLabel: question.highLabel,
          options: question.options,
          optional: question.optional ?? false,
          invertedScore: question.invertedScore ?? false,
          order: order++,
          isActive: true,
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