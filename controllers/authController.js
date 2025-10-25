const User = require('../models/User');
const Profile = require('../models/Profile');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60000; // 1 min cooldown
// const sendMail = require('../utils/sendMail'); // Uncomment when using email

exports.registerUser = async (req, res) => {
  console.log("Incoming registration body:", req.body);
  const { name, age, phone, email, password, role, consent, privacyNoticeAccepted, aadharNumber, abhaId, ...rest } = req.body;
  try {
    // Check for consent and privacy acceptance
    if (!consent) {
      return res.status(400).json({ message: "Consent is required as per Indian standards/ABDM." });
    }
    if (!privacyNoticeAccepted) {
      return res.status(400).json({ message: "Privacy notice must be accepted." });
    }
    if (!email && !phone) return res.status(400).json({ message: "Either email or phone is required" });
    // Only require password if not OAuth
    if (!req.body.oauthProvider && !password) return res.status(400).json({ message: "Password is required unless using OAuth login." });

    // Build filter only for non-empty supplied fields
    let filters = [];
    if (email) filters.push({ email });
    if (phone) filters.push({ phone });

    // Only check if any value is supplied
    if (filters.length > 0) {
      const userExists = await User.findOne({ $or: filters });
      if (userExists)
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, age, phone, email, password: hashedPassword, role, consent, privacyNoticeAccepted, aadharNumber, abhaId, ...rest
    });

    //await Profile.create({ userId: user._id, fullName: name, email: email, phone: phone });

    res.status(201).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utility functions to mask sensitive info
function maskAadhaar(aadhaar) {
  return aadhaar ? "XXXX-XXXX-" + aadhaar.slice(-4) : undefined;
}
function maskAbha(abha) {
  return abha ? abha.substring(0, 3) + "XXXXXX" + abha.slice(-3) : undefined;
}

// Example user profile endpoint with masking
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    ...user.toObject(),
    aadharNumber: maskAadhaar(user.aadharNumber),
    abhaId: maskAbha(user.abhaId),
    phone: user.phone ? "XXXXXX" + user.phone.slice(-4) : undefined,
    password: undefined // never expose!
  });
};


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
    if (!user) return res.status(404).json({ message: "User not found" });
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
