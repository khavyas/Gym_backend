import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number
        },
        phone: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true, // normalize emails
            trim: true,
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'consultant', 'superadmin'],
            default: 'user'
        },

        // ✅ Fields for Forgot Password / OTP
        resetOtp: {
            type: String
        }, // will hold the 6-digit OTP
        resetOtpExpiry: {
            type: Date
        }, // OTP expiration time
    },
    { timestamps: true }
);

// Optional cleanup: automatically remove expired OTPs (if needed later)
// userSchema.index({ resetOtpExpiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('User', userSchema);
