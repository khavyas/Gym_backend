import { z } from 'zod';

/**
 * User Registration DTO
 * Used when creating a new user account
 * Includes Indian standards/ABDM compliance fields
 */
export const registerUserDto = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    age: z.number().int().min(1).max(150).optional(),
    phone: z.string().trim().optional(),
    email: z
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long')
        .optional(), // Optional because OAuth users may not have password
    role: z
        .enum(['user', 'consultant'])
        .default('user')
        .optional(),
    consent: z
        .boolean()
        .refine((val) => val === true, {
            message: 'Consent is required as per Indian standards/ABDM.'
        }),
    privacyNoticeAccepted: z
        .boolean()
        .refine((val) => val === true, {
            message: 'Privacy notice must be accepted.'
        }),
    aadharNumber: z.string().optional(),
    abhaId: z.string().optional(),
    oauthProvider: z.string().optional(),
}).strict() // Disallow unknown fields
    .refine(
        (data) => data.email || data.phone,
        {
            message: 'Either email or phone is required',
            path: ['email'], // Error will be attached to email field
        }
    )
    .refine(
        (data) => data.oauthProvider || data.password,
        {
            message: 'Password is required unless using OAuth login.',
            path: ['password'],
        }
    );

/**
 * Verify OTP and Register DTO
 * Used when verifying OTP and completing user registration
 */
export const verifyOtpAndRegisterDto = z.object({
    phone: z.string().trim().optional(),
    email: z.string().email('Invalid email format').toLowerCase().trim().optional(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    age: z.number().int().min(1).max(150).optional(),
    role: z.enum(['user', 'consultant']).default('user').optional(),
    aadharNumber: z.string().optional(),
    abhaId: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long').optional(),
})
    .refine(
        (data) => data.email || data.phone,
        {
            message: 'Either email or phone is required',
            path: ['email'],
        }
    );

export const registerAdminDto = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    age: z.number().int().min(1).max(150).optional(),
    phone: z.string().optional(),
    email: z
        .email('Invalid email format')
        .min(1, 'Email is required')
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long')
});

/**
 * User Login DTO
 * Used for user authentication
 * Supports login via email, phone, or a generic identifier
 */
export const loginUserDto = z.object({
    email: z
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
    phone: z
        .string()
        .trim()
        .optional(),
    identifier: z
        .string()
        .trim()
        .optional(),
    password: z
        .string()
        .min(1, 'Password is required'),
}).strict()
    .refine(
        (data) => data.email || data.phone || data.identifier,
        {
            message: 'Email, phone, or identifier is required',
            path: ['email'],
        }
    );

/**
 * Update User DTO
 * Used when updating user information (all fields optional)
 */
export const updateUserDto = z.object({
    name: z.string().min(1, 'Name cannot be empty').max(100, 'Name is too long').optional(),
    age: z.number().int().min(1).max(150).optional(),
    phone: z.string().optional(),
    email: z
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long')
        .optional(),
    role: z
        .enum(['user', 'admin', 'consultant', 'superadmin'])
        .optional(),
});

/**
 * Forgot Password Request DTO
 * Used when user requests a password reset OTP
 */
export const forgotPasswordDto = z.object({
    email: z
        .email('Invalid email format')
        .min(1, 'Email is required')
        .toLowerCase()
        .trim(),
});

/**
 * Reset Password with OTP DTO
 * Used when user resets password using OTP
 */
export const resetPasswordDto = z.object({
    email: z
        .email('Invalid email format')
        .min(1, 'Email is required')
        .toLowerCase()
        .trim(),
    otp: z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only digits'),
    newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),
});

/**
 * Verify OTP DTO
 * Used to verify OTP without resetting password
 */
export const verifyOtpDto = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    otp: z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

/**
 * Change Password DTO
 * Used when authenticated user wants to change their password
 */
export const changePasswordDto = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(6, 'New password must be at least 6 characters')
        .max(100, 'Password is too long'),
});

/**
 * Get Users Query DTO
 * Used for filtering users in the get all users endpoint
 */
export const getUsersQueryDto = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.email('Invalid email format').toLowerCase().trim().optional(),
    phone: z.string().trim().optional(),
    role: z.enum(['user', 'admin', 'consultant', 'superadmin']).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    emailVerified: z.string().transform((val) => val === 'true').pipe(z.boolean()).optional(),
    phoneVerified: z.string().transform((val) => val === 'true').pipe(z.boolean()).optional(),
    oauthProvider: z.enum(['google', 'facebook', 'apple']).optional(),
    // Pagination
    page: z.string().optional().default('1').transform(Number).pipe(z.number().int().min(1)),
    limit: z.string().optional().default('10').transform(Number).pipe(z.number().int().min(1).max(100)),
    // Sorting
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict(); // Disallow unknown query parameters

// Type exports for TypeScript usage
export type RegisterUserDto = z.infer<typeof registerUserDto>;
export type VerifyOtpAndRegisterDto = z.infer<typeof verifyOtpAndRegisterDto>;
export type RegisterAdminDto = z.infer<typeof registerAdminDto>;
export type LoginUserDto = z.infer<typeof loginUserDto>;
export type UpdateUserDto = z.infer<typeof updateUserDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
export type GetUsersQueryDto = z.infer<typeof getUsersQueryDto>;

