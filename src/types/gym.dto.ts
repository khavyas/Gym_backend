import { z } from 'zod';

/**
 * Create Gym DTO
 * Used when a superadmin creates a new gym center
 */
export const createGymDto = z.object({
    name: z
        .string()
        .min(1, 'Gym name is required')
        .max(200, 'Gym name is too long')
        .trim(),
    address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address is too long')
        .trim(),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
            'Invalid phone number format'
        ),
    email: z
        .email('Invalid email format')
        .optional()
        .transform((val) => val?.toLowerCase().trim()),
    adminEmail: z
        .email('Invalid admin email format')
        .min(1, 'Admin email is required')
        .toLowerCase()
        .trim(),
    subscriptionPlan: z
        .enum(['basic', 'premium', 'enterprise'], {
            message: 'Subscription plan must be basic, premium, or enterprise'
        })
        .default('basic')
        .optional(),
});

/**
 * Update Gym DTO
 * Used when updating gym center information
 */
export const updateGymDto = z.object({
    name: z
        .string()
        .min(1, 'Gym name is required')
        .max(200, 'Gym name is too long')
        .trim()
        .optional(),
    address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address is too long')
        .trim()
        .optional(),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
            'Invalid phone number format'
        ),
    email: z
        .string()
        .email('Invalid email format')
        .optional()
        .transform((val) => val?.toLowerCase().trim()),
    subscriptionPlan: z
        .enum(['basic', 'premium', 'enterprise'], {
            message: 'Subscription plan must be basic, premium, or enterprise'
        })
        .optional(),
});

/**
 * Gym ID Param DTO
 * Used for validating gym ID in URL parameters
 */
export const gymIdParamDto = z.object({
    id: z.string().min(1, 'Gym ID is required'),
});

// Export types for TypeScript
export type CreateGymDto = z.infer<typeof createGymDto>;
export type UpdateGymDto = z.infer<typeof updateGymDto>;
export type GymIdParamDto = z.infer<typeof gymIdParamDto>;
