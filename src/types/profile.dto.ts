import { z } from 'zod';

// Health Metrics Schema
const healthMetricsSchema = z.object({
    weight: z.string().optional(),
    height: z.string().optional(),
    age: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    fitnessGoal: z.string().optional(),
});

// Work Preferences Schema
const workPreferencesSchema = z.object({
    occupation: z.string().optional(),
    workoutTiming: z.string().optional(),
    availableDays: z.array(z.string()).optional(),
    workStressLevel: z.string().optional(),
    sedentaryHours: z.string().optional(),
    workoutLocation: z.string().optional(),
});

// Notifications Schema
const notificationsSchema = z.object({
    workoutReminders: z.boolean().default(true),
    newContent: z.boolean().default(true),
    promotionOffers: z.boolean().default(false),
    appointmentReminders: z.boolean().default(true),
});

// Security Schema
const securitySchema = z.object({
    biometricLogin: z.boolean().default(false),
    twoFactorAuth: z.boolean().default(false),
});

// Address Schema
const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
});

// Create Profile DTO
export const createProfileDto = z.object({
    fullName: z.string().optional(),
    email: z.email('Invalid email format').optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.url('Invalid URL format').optional(),
    aadharNumber: z.string().regex(/^[0-9]{12}$/, 'Aadhar number must be exactly 12 digits').optional(),
    abhaId: z.string().optional(),
    healthMetrics: healthMetricsSchema.optional(),
    workPreferences: workPreferencesSchema.optional(),
    notifications: notificationsSchema.optional(),
    security: securitySchema.optional(),
    address: addressSchema.optional(),
    membershipStatus: z.enum(['active', 'trial', 'suspended']).default('active'),
    badgeCount: z.number().int().min(0).default(0),
    achievements: z.array(z.string()).optional(),
    referralCode: z.string().optional(),
}).refine(
    (data) => data.email || data.phone,
    {
        message: 'Either email or phone is required',
        path: ['email'],
    }
);

// Update Profile DTO (all fields optional except userId)
export const updateProfileDto = z.object({
    phone: z.string().optional(),
    bio: z.string().optional(),
    profileImage: z.string().url('Invalid URL format').optional(),
    aadharNumber: z.string().regex(/^[0-9]{12}$/, 'Aadhar number must be exactly 12 digits').optional(),
    abhaId: z.string().optional(),
    healthMetrics: healthMetricsSchema.optional(),
    workPreferences: workPreferencesSchema.optional(),
    notifications: notificationsSchema.optional(),
    security: securitySchema.optional(),
    address: addressSchema.optional(),
    membershipStatus: z.enum(['active', 'trial', 'suspended']).optional(),
    badgeCount: z.number().int().min(0).optional(),
    achievements: z.array(z.string()).optional(),
});

// Type exports
export type CreateProfileDTO = z.infer<typeof createProfileDto>;
export type UpdateProfileDTO = z.infer<typeof updateProfileDto>;
