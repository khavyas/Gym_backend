const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60000; // 1 min cooldown
// const sendMail = require('../utils/sendMail'); // Uncomment when using email

// ============================================
// NEW USER REGISTRATION (Step 1: Send OTP)
// ============================================
exports.registerUser = async (req, res) => {
  console.log("Incoming registration body:", req.body);
  const { phone, email, consent, privacyNoticeAccepted, oauthProvider } = req.body;

  try {
    // Validate consent and privacy
    if (!consent) {
      return res.status(400).json({ message: "Consent is required as per Indian standards/ABDM." });
    }
    if (!privacyNoticeAccepted) {
      return res.status(400).json({ message: "Privacy notice must be accepted." });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "Either email or phone is required" });
    }

    // Check if user already exists
    let filters = [];
    if (email) filters.push({ email });
    if (phone) filters.push({ phone });
    if (filters.length > 0) {
      const userExists = await User.findOne({ $or: filters });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    // OAuth flow: instant registration
    if (oauthProvider) {
      const user = await User.create({
        phone, email, consent, privacyNoticeAccepted, oauthProvider, isVerified: true
      });
      return res.status(201).json({
        success: true,
        userId: user._id,
        token: generateToken(user._id),
        message: "OAuth registration successful"
      });
    }

    // OTP flow: Generate and send OTP (DO NOT create user yet)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database
    await Otp.create({ otp, email, phone });

    // Send OTP via SMS/Email (mocked for dev)
    // await sendSMS(phone, `Your OTP is ${otp}`);
    // await sendMail(email, `Your OTP is ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent for verification. Please verify to complete registration.",
      otp // Remove in production!
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// VERIFY OTP AND CREATE USER (Step 2)
// ============================================
exports.verifyOtpAndRegister = async (req, res) => {
  const { phone, email, otp, name, age, role, aadharNumber, abhaId, password } = req.body;

  try {
    // Find OTP record in database
    const otpRecord = await Otp.findOne({
      $or: [{ email }, { phone }],
      otp
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }

    // Check if user already exists (safety check)
    let filters = [];
    if (email) filters.push({ email });
    if (phone) filters.push({ phone });
    const userExists = await User.findOne({ $or: filters });
    if (userExists) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // Build user data
    const userData = {
      name,
      age,
      phone,
      email,
      role: role || 'user',
      consent: true, // Already validated during /register
      privacyNoticeAccepted: true,
      aadharNumber,
      abhaId,
      isVerified: true // Mark as verified since OTP is confirmed
    };

    // If password provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    // NOW create the user (after OTP verification)
    const user = await User.create(userData);

    // Delete OTP record after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: user._id,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UTILITY FUNCTIONS - Mask Sensitive Info
// ============================================
function maskAadhaar(aadhaar) {
  return aadhaar ? "XXXX-XXXX-" + aadhaar.slice(-4) : undefined;
}

function maskAbha(abha) {
  return abha ? abha.substring(0, 3) + "XXXXXX" + abha.slice(-3) : undefined;
}

// ============================================
// GET USER PROFILE (with masking)
// ============================================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({
      ...user.toObject(),
      aadharNumber: maskAadhaar(user.aadharNumber),
      abhaId: maskAbha(user.abhaId),
      phone: user.phone ? "XXXXXX" + user.phone.slice(-4) : undefined,
      password: undefined // never expose!
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// LOGIN USER
// ============================================
exports.loginUser = async (req, res) => {
  const { email, phone, password, identifier } = req.body; 
  try {
    // Decide what the user entered: email or phone
    const query = {};
    if (email) query.email = email;
    else if (phone) query.phone = phone;
    else if (identifier) {
      if (/^\d+$/.test(identifier)) query.phone = identifier; // all digits ⇒ phone
      else query.email = identifier.toLowerCase(); // otherwise ⇒ email
    } else {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    // Find user by either field
    const user = await User.findOne(query);
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    if (!userId || !newPassword) {
      return res.status(400).json({ message: "userId and newPassword are required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEND OTP endpoint
exports.sendOtp = async (req, res) => {
  const { email, phone } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) return res.status(404).json({ success: false, message: "User not registered" });

    const now = Date.now();
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Maximum OTP resend attempts reached, please try later.' });
    }
    if (user.otpLastSent && now - user.otpLastSent.getTime() < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - user.otpLastSent.getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${waitSeconds} seconds before requesting OTP again.` });
    }

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    user.otp = otp;
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    user.otpLastSent = new Date();
    await user.save();

    await Otp.create({ otp, userid: user._id, email: user.email, phone: user.phone });

    // await sendMail(user.email, `Your OTP is ${otp}`); // Uncomment after setup
    res.json({ success: true, message: "OTP sent", otp }); // Expose OTP for dev/testing only
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// CONFIRM OTP endpoint
exports.confirmOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "Email not registered" });

  const otpRecord = await Otp.findOne({ email, otp, userid: user._id });
  const isValid = otpRecord && user.otp === otp;
  res.json({ success: isValid, message: isValid ? "OTP verified" : "OTP invalid" });
};

// VERIFY EMAIL endpoint
exports.verifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    // await sendMail(email, "Verification link or OTP here");
    res.json({ success: true, message: "Email registered" });
  } else {
    res.json({ success: false, message: "Email not registered" });
  }
};
