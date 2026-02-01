/**
 * seedWellnessQuestions.js
 *
 * Pure JS — no TypeScript needed. Runs directly with Node.
 *
 * Usage (first time):
 *   node src/seeds/seedWellnessQuestions.js
 *
 * Force re-seed (wipe + re-insert):
 *   FORCE_RESEED=true node src/seeds/seedWellnessQuestions.js
 */

const mongoose = require('mongoose');
require('dotenv').config();


const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym_app';
// ── Schema (mirrors your WellnessQuestion.ts model exactly) ──
const WellnessQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true, unique: true },
    question:   { type: String, required: true, trim: true },
    type:       { type: String, enum: ['scale', 'multiple-choice', 'text'], required: true },
    options:    { type: [String], default: undefined },
    multiSelect:{ type: Boolean, default: false },
    placeholder:{ type: String, default: undefined },
    order:      { type: Number, required: true },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

WellnessQuestionSchema.index({ order: 1 });

const WellnessQuestion = mongoose.model('WellnessQuestion', WellnessQuestionSchema);

// ── All 15 questions — exact copy from constants/wellnessQuestions.ts ──
const questionsToSeed = [
  {
    questionId: 1,
    question: "How would you describe your energy levels throughout the day?",
    type: 'multiple-choice',
    options: ['Very low', 'Below average', 'Moderate', 'Good', 'Excellent'],
    multiSelect: false,
    order: 1,
    isActive: true,
  },
  {
    questionId: 2,
    question: "How often do you feel low on energy or fatigued during the day?",
    type: 'multiple-choice',
    options: ['Rarely', 'Sometimes', 'Often', 'Always'],
    multiSelect: false,
    order: 2,
    isActive: true,
  },
  {
    questionId: 3,
    question: "How would you describe your current stress level?",
    type: 'multiple-choice',
    options: ['Low', 'Moderate', 'High'],
    multiSelect: false,
    order: 3,
    isActive: true,
  },
  {
    questionId: 4,
    question: "How often do you engage in physical activity (e.g., walking, gym, yoga)?",
    type: 'multiple-choice',
    options: ['Daily', 'Few times a week', 'Occasionally', 'Rarely'],
    multiSelect: false,
    order: 4,
    isActive: true,
  },
  {
    questionId: 5,
    question: "How many hours of sleep do you usually get per night?",
    type: 'multiple-choice',
    options: ['Less than 5 hours', '5-6 hours', '6-7 hours', '7-8 hours', 'More than 8 hours'],
    multiSelect: false,
    order: 5,
    isActive: true,
  },
  {
    questionId: 6,
    question: "How would you describe your eating habits?",
    type: 'multiple-choice',
    options: ['Regular meals', 'Irregular', 'Skipped meals', 'Emotional eating'],
    multiSelect: false,
    order: 6,
    isActive: true,
  },
  {
    questionId: 7,
    question: "How often do you feel anxious, irritable, or overwhelmed?",
    type: 'multiple-choice',
    options: ['Rarely', 'Sometimes', 'Often'],
    multiSelect: false,
    order: 7,
    isActive: true,
  },
  {
    questionId: 8,
    question: "What usually influences your mood the most? (Select all that apply)",
    type: 'multiple-choice',
    options: ['Work stress', 'Relationships', 'Sleep', 'Health', 'Social connection', 'Other'],
    multiSelect: true,
    order: 8,
    isActive: true,
  },
  {
    questionId: 9,
    question: "Do you currently use tobacco products?",
    type: 'multiple-choice',
    options: [
      "No, I don't use tobacco",
      'Occasionally (social situations)',
      'Regularly (daily)',
      'Trying to quit',
      'Prefer not to say'
    ],
    multiSelect: false,
    order: 9,
    isActive: true,
  },
  {
    questionId: 10,
    question: "How would you describe your alcohol consumption?",
    type: 'multiple-choice',
    options: [
      "I don't drink alcohol",
      'Rarely (special occasions only)',
      'Socially (1-2 times per week)',
      'Regularly (3-4 times per week)',
      'Daily',
      'Prefer not to say'
    ],
    multiSelect: false,
    order: 10,
    isActive: true,
  },
  {
    questionId: 11,
    question: "Do you have any existing medical conditions or medications?",
    type: 'text',
    placeholder: 'Enter conditions or medications (optional)',
    order: 11,
    isActive: true,
  },
  {
    questionId: 12,
    question: "What are your top 1-2 health goals right now?",
    type: 'multiple-choice',
    options: [
      'Weight management',
      'Better sleep',
      'Stress reduction',
      'Improve energy',
      'Pain relief',
      'Fitness'
    ],
    multiSelect: true,
    order: 12,
    isActive: true,
  },
  {
    questionId: 13,
    question: "How much time can you realistically dedicate to your health each day?",
    type: 'multiple-choice',
    options: ['Less than 15 minutes', '15-30 minutes', '30-60 minutes', 'More than 1 hour'],
    multiSelect: false,
    order: 13,
    isActive: true,
  },
  {
    questionId: 14,
    question: "What kind of support would help you most?",
    type: 'multiple-choice',
    options: [
      'Personal coaching',
      'Daily tips',
      'Group challenges',
      'App reminders',
      'Progress tracking'
    ],
    multiSelect: false,
    order: 14,
    isActive: true,
  },
  {
    questionId: 15,
    question: "What best describes your current motivation to improve your health?",
    type: 'multiple-choice',
    options: ['Just thinking about it', 'Ready to start soon', 'Actively working on it', 'Fully committed'],
    multiSelect: false,
    order: 15,
    isActive: true,
  },
];

// ── Run ──
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const forceReseed = process.env.FORCE_RESEED === 'true';
    const existingCount = await WellnessQuestion.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`⏭️  Skipped. ${existingCount} questions already exist.`);
      console.log('   Run with: FORCE_RESEED=true node src/seeds/seedWellnessQuestions.js');
      await mongoose.disconnect();
      return;
    }

    if (forceReseed) {
      await WellnessQuestion.deleteMany({});
      console.log('🗑️  Wiped existing questions (FORCE_RESEED)');
    }

    const inserted = await WellnessQuestion.insertMany(questionsToSeed);
    console.log(`✅ Seeded ${inserted.length} wellness questions:\n`);
    inserted.forEach((q) => {
      console.log(`   [${q.order}] Q${q.questionId}: "${q.question}" (${q.type}${q.multiSelect ? ' • multi-select' : ''})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();