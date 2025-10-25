const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"], required: false },
    dateOfBirth: { type: Date },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    otp: { type: String },
    otpAttempts: { type: Number, default: 0 }, //For throttling OTP attempts
    otpLastSent: { type: Date }, //For controlling resend timer
    aadharNumber: { type: String, minlength: 12, maxlength: 12, match: /^[0-9]{12}$/, required: false},
    abhaId: { type: String, required: false }, // Optional: For ABDM/NDHM Health ID
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },
    consent: { type: Boolean, required: true }, // ABDM-style consent
    privacyNoticeAccepted: { type: Boolean, required: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    oauthProvider: { type: String, enum: ["google", "facebook", "apple"] }, // for Social Login
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

// Encryption keys (store in .env in production!)
const encKey = process.env.MONGO_ENCRYPT_KEY;  // 32 bytes base64
const sigKey = process.env.MONGO_SIGN_KEY;     // 64 bytes base64

userSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ['aadharNumber', 'abhaId']
});

// Custom validator to require either phone or email
userSchema.path('email').validate(function(value) {
  return value || this.phone;
}, 'Either email or phone is required.');

userSchema.path('phone').validate(function(value) {
  return value || this.email;
}, 'Either phone or email is required.');

module.exports = mongoose.model('User', userSchema);

