import { z } from 'zod';

/**
 * User Registration DTO
 * Used when creating a new user account
 */
export const registerUserDto = z.object({
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
        .max(100, 'Password is too long'),
    role: z
        .enum(['user', 'consultant',])
        .default('user')
        .optional(),
});

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
 */
export const loginUserDto = z.object({
    email: z
        .email('Invalid email format')
        .min(1, 'Email is required')
        .toLowerCase()
        .trim(),
    password: z.string().min(1, 'Password is required'),
});

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

// Type exports for TypeScript usage
export type RegisterUserDto = z.infer<typeof registerUserDto>;
export type RegisterAdminDto = z.infer<typeof registerAdminDto>;
export type LoginUserDto = z.infer<typeof loginUserDto>;
export type UpdateUserDto = z.infer<typeof updateUserDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
