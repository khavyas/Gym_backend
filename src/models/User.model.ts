import mongoose, { InferSchemaType } from 'mongoose';
import encrypt from 'mongoose-encryption';

const userSchema = new mongoose.Schema(
  {
    _id: new mongoose.Types.ObjectId(),
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"], required: false },
    dateOfBirth: { type: Date },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      }
    },
    otp: { type: String },
    otpAttempts: { type: Number, default: 0 },
    otpLastSent: { type: Date },
    aadharNumber: {
      type: String,
      minlength: 12,
      maxlength: 12,
      match: /^[0-9]{12}$/,
      required: false
    },
    abhaId: { type: String, required: false },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },
    consent: { type: Boolean, required: true },
    privacyNoticeAccepted: { type: Boolean, required: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    oauthProvider: {
      type: String,
      enum: ["google", "facebook", "apple"]
    },
    oauthId: { type: String },
    role: {
      type: String,
      enum: ['user', 'admin', 'consultant', 'superadmin'],
      default: 'user'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// // ✅ ONLY apply encryption if keys are provided
// const encKey = process.env.MONGO_ENCRYPT_KEY;
// const sigKey = process.env.MONGO_SIGN_KEY;

// if (encKey && sigKey) {
//   console.log('✅ Encryption enabled for sensitive fields');
//   userSchema.plugin(encrypt, {
//     encryptionKey: encKey,
//     signingKey: sigKey,
//     encryptedFields: ['aadharNumber', 'abhaId']
//   });
// } else {
//   console.warn('⚠️  WARNING: Encryption keys not found. Sensitive data will NOT be encrypted!');
// }

// Validator: Check that at least one exists (email or phone)
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either email or phone is required');
    this.invalidate('phone', 'Either email or phone is required');
  }
  next();
});

export type UserType = InferSchemaType<typeof userSchema>;

export default mongoose.model<UserType>('User', userSchema);
