const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const userSchema = new mongoose.Schema(
  {
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
      required: function() {
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

// Encryption keys (store in .env in production!)
const encKey = process.env.MONGO_ENCRYPT_KEY;  // 32 bytes base64
const sigKey = process.env.MONGO_SIGN_KEY;     // 64 bytes base64

userSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ['aadharNumber', 'abhaId']
});

// Validator: Check that at least one exists (email or phone)
userSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either email or phone is required');
    this.invalidate('phone', 'Either email or phone is required');
  }
  next();
});

module.exports = mongoose.model('User', userSchema);  