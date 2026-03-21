import { z } from 'zod';

/**
 * Check-In Answer DTO
 * Used for validating a single answer entry
 */
export const checkInAnswerDto = z.object({
    questionId: z.string().min(1, 'questionId is required'),
    value: z.union([
        z.number(),
        z.string(),
        z.boolean(),
        z.array(z.string()),
    ]),
}).strict();

/**
 * Check-In Response DTO
 * Used for validating a stored check-in response
 */
export const submitCheckInResponseDto = z.object({
    _id: z.string().optional(),
    userId: z.string().min(1, 'userId is required'),
    note: z.string().optional(),
    answers: z.array(checkInAnswerDto).min(1, 'answers are required'),
    submittedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
}).strict();

export const getCheckInQuestionQueryDto = z.object({
    target: z.enum(['user', 'coordinator']).default('user'),
}).strict();

export type CheckInAnswerDto = z.infer<typeof checkInAnswerDto>;
export type SubmitCheckInResponseDto = z.infer<typeof submitCheckInResponseDto>;
export type GetCheckInQuestionQueryDto = z.infer<typeof getCheckInQuestionQueryDto>;
