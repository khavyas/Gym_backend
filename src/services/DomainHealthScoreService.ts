import { Types } from 'mongoose';
import CheckInQuestion from '../models/CheckInQuestion.model';
import CheckInResponse from '../models/CheckInResponse.model';
import Domain from '../models/Domain.model';
import DomainHealthScore, {
  IDomainHealthScore,
} from '../models/DomainHealthScores';
import User from '../models/User.model';

type QuestionMeta = {
  _id: Types.ObjectId;
  domain: Types.ObjectId;
  weight: number;
};

type ScoreAccumulator = {
  questionObjectId: Types.ObjectId;
  domainId: string;
  total: number;
  count: number;
  weight: number;
};

type LeanAnswer = {
  questionId: Types.ObjectId;
  value: number | string;
  normalizedScore?: number;
};

type LeanResponse = {
  _id: Types.ObjectId;
  submittedAt: Date;
  answers: LeanAnswer[];
};

export type CalculateDomainHealthScoresResult = {
  dataPointCount: number;
  responseCountUsed: number;
  windowStart: Date;
  windowEnd: Date;
  scores: IDomainHealthScore[];
};

const clampScore = (score: number) => Math.max(0, Math.min(100, score));

const getStatusFromDhi = (dhi: number): 'green' | 'yellow' | 'red' => {
  if (dhi >= 70) return 'green';
  if (dhi >= 40) return 'yellow';
  return 'red';
};

export const calculateDomainHealthScores = async (
  userId: string
): Promise<CalculateDomainHealthScoresResult> => {
  // Ensure we only calculate scores for a real user.
  const user = await User.findById(userId).select('_id');
  if (!user) {
    throw new Error('User not found');
  }

  // Use the latest 7 check-in submissions as the scoring window.
  const latestResponses = (await CheckInResponse.find({ userId })
    .sort({ submittedAt: -1 })
    .limit(7)
    .select('answers submittedAt')
    .lean()) as unknown as LeanResponse[];

  if (latestResponses.length === 0) {
    throw new Error('No check-in responses found for this user');
  }

  const domains = await Domain.find().select('_id').lean();

  // Load only the questions that actually appear in the selected responses so we can
  // map each answer back to its domain and weight.
  const questionIds = Array.from(
    new Set(
      latestResponses.flatMap((response) =>
        response.answers.map((answer) => String(answer.questionId))
      )
    )
  );

  const questions = (await CheckInQuestion.find({ _id: { $in: questionIds } })
    .select('_id domain weight')
    .lean()) as unknown as QuestionMeta[];

  const questionById = new Map<string, QuestionMeta>(
    questions.map((question) => [String(question._id), question])
  );

  // Aggregate normalized scores per question across the 7-response window.
  // This gives us the numerator and count needed for each question mean.
  const scoreByQuestionId = new Map<string, ScoreAccumulator>();

  latestResponses.forEach((response) => {
    response.answers.forEach((answer) => {
      // The submit controller is responsible for storing normalizedScore,
      // so we only aggregate answers that already have it.
      if (typeof answer.normalizedScore !== 'number') return;

      const question = questionById.get(String(answer.questionId));
      if (!question) return;

      const questionId = String(answer.questionId);
      const existing = scoreByQuestionId.get(questionId);
      const score = clampScore(answer.normalizedScore);

      if (existing) {
        existing.total += score;
        existing.count += 1;
        return;
      }

      scoreByQuestionId.set(questionId, {
        questionObjectId: answer.questionId,
        domainId: String(question.domain),
        total: score,
        count: 1,
        weight: question.weight ?? 0,
      });
    });
  });

  const sortedResponses = [...latestResponses].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  // Store the actual response window used to generate these scores.
  const windowStart = new Date(sortedResponses[0].submittedAt);
  const windowEnd = new Date(sortedResponses[sortedResponses.length - 1].submittedAt);
  const sourceResponseIds = latestResponses.map((response) => response._id);

  const savedScores = await Promise.all(
    domains.map(async (domain) => {
      // Step 1: mean normalized score for each question in this domain.
      const metricMeans = Array.from(scoreByQuestionId.values())
        .filter((metric) => metric.domainId === String(domain._id))
        .map((metric) => ({
          questionId: metric.questionObjectId,
          averageValue: Number((metric.total / metric.count).toFixed(2)),
          weight: metric.weight,
        }));

      // Step 2: apply the seeded question weight to each question mean.
      const weightedMetrics = metricMeans.map((metric) => ({
        questionId: metric.questionId,
        weightedValue: Number((metric.averageValue * metric.weight).toFixed(2)),
        weight: metric.weight,
      }));

      // Step 3: divide the weighted sum by the domain's total question weight
      // so the final DHI stays on a true 0-100 scale for that domain.
      const totalDomainWeight = weightedMetrics.reduce(
        (sum, metric) => sum + metric.weight,
        0
      );
      const weightedSum = weightedMetrics.reduce(
        (sum, metric) => sum + metric.weightedValue,
        0
      );
      const dhi = Number(
        (totalDomainWeight > 0 ? weightedSum / totalDomainWeight : 0).toFixed(2)
      );

      return DomainHealthScore.create({
        userId,
        domain: domain._id,
        windowType: '14_day',
        windowStart,
        windowEnd,
        dataPointCount: latestResponses.length,
        metricMeans: metricMeans.map(({ questionId, averageValue }) => ({
          questionId,
          averageValue,
        })),
        weightedMetrics,
        dhi,
        status: getStatusFromDhi(dhi),
        sourceResponseIds,
        calculatedAt: new Date(),
      });
    })
  );

  return {
    dataPointCount: latestResponses.length,
    responseCountUsed: latestResponses.length,
    windowStart,
    windowEnd,
    scores: savedScores,
  };
};
