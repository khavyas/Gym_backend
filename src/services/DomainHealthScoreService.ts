import { Types } from 'mongoose';
import CheckInQuestion from '../models/CheckInQuestion.model';
import CheckInResponse from '../models/CheckInResponse.model';
import Consultant from '../models/Consultant.model';
import Domain from '../models/Domain.model';
import DomainHealthScore, {
  IDomainHealthScore,
} from '../models/DomainHealthScores.model';
import User from '../models/User.model';
import sendEmail from '../utils/sendEmail';

type QuestionMeta = {
  _id: Types.ObjectId;
  domain: Types.ObjectId;
  weight: number;
};

type ScoreAccumulator = {
  questionObjectId: Types.ObjectId;
  domainId: string;
  normalizedTotal: number;
  normalizedCount: number;
  rawTotal: number;
  rawCount: number;
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

type RedDomainSummary = {
  domainId: string;
  domainLabel: string;
  dhi: number;
};

type ConsultantSummary = {
  consultantName: string;
  meetingLink?: string;
  domains: RedDomainSummary[];
};

const clampScore = (score: number) => Math.max(0, Math.min(100, score));

const getStatusFromDhi = (dhi: number): 'green' | 'yellow' | 'red' => {
  if (dhi >= 70) return 'green';
  if (dhi >= 40) return 'yellow';
  return 'red';
};

const buildRedDomainListHtml = (domains: RedDomainSummary[]) =>
  domains
    .map(
      (domain) =>
        `<li><strong>${domain.domainLabel}</strong> (DHI: ${domain.dhi.toFixed(2)})</li>`
    )
    .join('');

const buildConsultantSupportListHtml = (consultants: ConsultantSummary[]) =>
  consultants
    .map((consultant) => {
      const supportedDomains = consultant.domains
        .map((domain) => domain.domainLabel)
        .join(', ');

      return `
        <li>
          <strong>${consultant.consultantName}</strong><br/>
          Domains: ${supportedDomains}<br/>
          Meeting Link: ${consultant.meetingLink || 'Will be shared separately'}
        </li>
      `;
    })
    .join('');

export const sendRedDomainDhiAlertEmails = async (
  userId: string,
  scores: IDomainHealthScore[]
) => {
  // Step 1:
  // From the full set of freshly calculated DHI records, keep only the domains
  // whose status is "red". These are the only domains that should trigger alerts.
  const redScores = scores.filter((score) => score.status === 'red');

  // If there are no red domains for this user, we can exit immediately without
  // doing any extra database lookups or email work.
  if (redScores.length === 0) {
    return {
      redDomainCount: 0,
      userEmailSent: false,
      consultantEmailsSent: 0,
    };
  }

  const redDomainIds = Array.from(
    new Set(redScores.map((score) => String(score.domain)))
  );

  // Step 2:
  // Load everything needed to build the email payloads in parallel:
  // 1. the user receiving the alert,
  // 2. the domain documents so we can show human-friendly domain labels,
  // 3. the consultants assigned to any of the red domains.
  //
  // We populate consultant.user because consultant emails are stored on the User model,
  // not directly on the Consultant profile.
  const [user, redDomains, consultants] = await Promise.all([
    User.findById(userId).select('name email').lean(),
    Domain.find({ _id: { $in: redDomainIds } })
      .select('_id domainId domainLabel')
      .lean(),
    Consultant.find({ domain: { $in: redDomainIds } })
      .populate('user', 'name email')
      .select('user domain specialty meetingLink')
      .lean(),
  ]);

  // Create a lookup map from Mongo domain _id -> presentation fields.
  // This lets us transform the score records into email-friendly summaries
  // without repeatedly scanning the domain array.
  const domainById = new Map(
    redDomains.map((domain: any) => [
      String(domain._id),
      {
        domainId: domain.domainId,
        domainLabel: domain.domainLabel,
      },
    ])
  );

  // Step 3:
  // Build the exact list of red-domain summaries that will appear in emails.
  // Each summary contains:
  // - the stable domainId
  // - the readable domainLabel
  // - the DHI value for this calculation run
  //
  // We also sort the list by DHI ascending so the most urgent domains appear first.
  const redDomainSummaries: RedDomainSummary[] = redScores
    .map((score) => {
      const domain = domainById.get(String(score.domain));

      if (!domain) return null;

      return {
        domainId: domain.domainId,
        domainLabel: domain.domainLabel,
        dhi: score.dhi,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.dhi - b.dhi) as RedDomainSummary[];

  // A second safety exit: if for some reason the score documents reference domains
  // that we could not resolve, we avoid sending incomplete emails.
  if (redDomainSummaries.length === 0) {
    return {
      redDomainCount: 0,
      userEmailSent: false,
      consultantEmailsSent: 0,
    };
  }

  const redDomainSummaryByMongoId = new Map(
    redDomainSummaries.map((domainSummary) => {
      const matchingDomain = redDomains.find(
        (domain: any) => domain.domainId === domainSummary.domainId
      );

      return [String(matchingDomain?._id), domainSummary];
    })
  );

  // Step 4:
  // Build a per-consultant notification payload.
  //
  // Why a map keyed by email?
  // A consultant may be linked to multiple red domains, and in some setups there
  // could be duplicate consultant records or overlapping assignments. Grouping by
  // email ensures each consultant receives one consolidated email instead of many.
  const consultantNotifications = new Map<
    string,
    { consultantName: string; domains: RedDomainSummary[] }
  >();
  const consultantSummariesForUser = new Map<string, ConsultantSummary>();

  consultants.forEach((consultant: any) => {
    // Consultant emails come from the populated User document.
    const consultantUser = consultant.user as { name?: string; email?: string } | undefined;
    const consultantEmail = consultantUser?.email?.trim();

    // Keep only the red domains that overlap with this consultant's assigned domains.
    const relevantDomains = (consultant.domain || [])
      .map((domainId: Types.ObjectId | string) =>
        redDomainSummaryByMongoId.get(String(domainId))
      )
      .filter(Boolean) as RedDomainSummary[];

    // If this consultant does not cover any of the current red domains,
    // there is nothing to notify them about.
    if (relevantDomains.length === 0) return;

    // Build the consultant list that will be shown to the user so the email includes
    // the names and meeting links for the consultants mapped to the red domains.
    consultantSummariesForUser.set(String(consultant._id), {
      consultantName: consultantUser?.name || 'Consultant',
      meetingLink: consultant.meetingLink || '',
      domains: Array.from(
        new Map(relevantDomains.map((domain) => [domain.domainId, domain])).values()
      ).sort((a, b) => a.dhi - b.dhi),
    });

    // If a consultant has no email address, we still include them in the user-facing
    // consultant list, but we skip sending the consultant alert email.
    if (!consultantEmail) return;

    const existingNotification = consultantNotifications.get(consultantEmail);
    if (existingNotification) {
      // Merge and deduplicate domains so repeat assignments still produce
      // a single clean list in the outgoing email.
      const mergedDomains = [...existingNotification.domains, ...relevantDomains];
      const uniqueDomains = Array.from(
        new Map(mergedDomains.map((domain) => [domain.domainId, domain])).values()
      ).sort((a, b) => a.dhi - b.dhi);

      existingNotification.domains = uniqueDomains;
      return;
    }

    consultantNotifications.set(consultantEmail, {
      consultantName: consultantUser?.name || 'Consultant',
      domains: Array.from(
        new Map(relevantDomains.map((domain) => [domain.domainId, domain])).values()
      ).sort((a, b) => a.dhi - b.dhi),
    });
  });

  const consultantSupportSummaries = Array.from(
    consultantSummariesForUser.values()
  ).sort((a, b) => a.consultantName.localeCompare(b.consultantName));

  // Step 5:
  // Build all email promises first, then send them together with Promise.allSettled.
  // This gives us two benefits:
  // - faster overall delivery because emails are sent concurrently
  // - partial success handling because one failed email will not cancel the rest
  const emailJobs: Promise<any>[] = [];
  const emailTargets: Array<'user' | 'consultant'> = [];

  // Send a summary email to the user when an email address is available.
  if (user?.email) {
    emailTargets.push('user');
    emailJobs.push(
      sendEmail({
        to: user.email,
        subject: 'Important update on your domain health indicators',
        html: `
          <p>Dear ${user.name || 'User'},</p>
          <p>Your latest check-in shows that the following domain health indicators are currently in the red zone:</p>
          <ul>${buildRedDomainListHtml(redDomainSummaries)}</ul>
          ${
            consultantSupportSummaries.length > 0
              ? `<p>Please connect with the following consultants for support:</p>
                 <ul>${buildConsultantSupportListHtml(consultantSupportSummaries)}</ul>`
              : ''
          }
          <p>Relevant domain consultants have been notified where contact details are available so they can review and support you.</p>
          <p>Best regards,<br/>Hiwox Team</p>
        `,
      })
    );
  }

  // Send one email per consultant with only the domains relevant to that consultant.
  consultantNotifications.forEach((notification, consultantEmail) => {
    emailTargets.push('consultant');
    emailJobs.push(
      sendEmail({
        to: consultantEmail,
        subject: 'User domain health indicator requires attention',
        html: `
          <p>Dear ${notification.consultantName},</p>
          <p>${user?.name || 'A user'} has one or more domain health indicators in the red zone that match your assigned domains:</p>
          <p><strong>User Email:</strong> ${user?.email || 'Not available'}</p>
          <ul>${buildRedDomainListHtml(notification.domains)}</ul>
          <p>Please review the case and connect with the user if needed.</p>
          <p>Best regards,<br/>Hiwox Team</p>
        `,
      })
    );
  });

  // Step 6:
  // Wait for all sends to finish, then compute delivery statistics from the results.
  // We intentionally use allSettled so a single Brevo failure does not break the
  // rest of the notification flow.
  const emailResults = await Promise.allSettled(emailJobs);

  // Mark the user email as sent only if there was a user-targeted email and
  // that specific promise fulfilled successfully.
  const userEmailSent = emailResults.some(
    (result, index) => emailTargets[index] === 'user' && result.status === 'fulfilled'
  );

  // Count only successfully delivered consultant emails, not just attempted ones.
  const consultantEmailsSent = emailResults.reduce((count, result, index) => {
    if (emailTargets[index] !== 'consultant' || result.status !== 'fulfilled') {
      return count;
    }

    return count + 1;
  }, 0);

  // Collect failures for logging so operational issues can be debugged
  // without interrupting DHI score creation.
  const failedEmails = emailResults.filter(
    (result) => result.status === 'rejected'
  );

  if (failedEmails.length > 0) {
    console.error(
      'Some red DHI alert emails failed to send:',
      failedEmails.map((result: PromiseRejectedResult) => result.reason)
    );
  }

  return {
    redDomainCount: redDomainSummaries.length,
    userEmailSent,
    consultantEmailsSent,
  };
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

  // Aggregate both normalized and raw answer values per question across the
  // 7-response window so we can store both averages on the score snapshot.
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
      const numericAnswerValue =
        typeof answer.value === 'number' ? answer.value : null;

      if (existing) {
        existing.normalizedTotal += score;
        existing.normalizedCount += 1;
        if (numericAnswerValue !== null) {
          existing.rawTotal += numericAnswerValue;
          existing.rawCount += 1;
        }
        return;
      }

      scoreByQuestionId.set(questionId, {
        questionObjectId: answer.questionId,
        domainId: String(question.domain),
        normalizedTotal: score,
        normalizedCount: 1,
        rawTotal: numericAnswerValue ?? 0,
        rawCount: numericAnswerValue !== null ? 1 : 0,
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
      // Step 1: calculate both raw and normalized averages for each question.
      const metrics = Array.from(scoreByQuestionId.values())
        .filter((metric) => metric.domainId === String(domain._id))
        .map((metric) => ({
          questionId: metric.questionObjectId,
          averageValue:
            metric.rawCount > 0
              ? Number((metric.rawTotal / metric.rawCount).toFixed(2))
              : null,
          normalizedAverageValue: Number(
            (metric.normalizedTotal / metric.normalizedCount).toFixed(2)
          ),
          weight: metric.weight,
        }));

      // Step 2: apply the seeded question weight to each normalized mean.
      const weightedMetrics = metrics.map((metric) => ({
        questionId: metric.questionId,
        averageValue: metric.averageValue,
        normalizedAverageValue: metric.normalizedAverageValue,
        normalizedAverageWeightedValue: Number(
          (metric.normalizedAverageValue * metric.weight).toFixed(2)
        ),
        weight: metric.weight,
      }));

      // Step 3: divide the weighted sum by the domain's total question weight
      // so the final DHI stays on a true 0-100 scale for that domain.
      const totalDomainWeight = weightedMetrics.reduce(
        (sum, metric) => sum + metric.weight,
        0
      );
      const weightedSum = weightedMetrics.reduce(
        (sum, metric) => sum + metric.normalizedAverageWeightedValue,
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
        metrics: weightedMetrics,
        dhi,
        status: getStatusFromDhi(dhi),
        sourceResponseIds,
        calculatedAt: new Date(),
      });
    })
  );

  try {
    await sendRedDomainDhiAlertEmails(userId, savedScores);
  } catch (emailError) {
    console.error('Error sending red DHI alert emails:', emailError);
  }

  return {
    dataPointCount: latestResponses.length,
    responseCountUsed: latestResponses.length,
    windowStart,
    windowEnd,
    scores: savedScores,
  };
};
