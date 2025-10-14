const User = require('../models/User');
const Profile = require('../models/Profile'); // <-- import Profile model
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail'); // you'll create this next

// @desc Register new user
exports.registerUser = async (req, res) => {
  const { name, age, phone, email, password, role } = req.body;

  try {
    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name,
      age,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    // create profile linked to the user
    await Profile.create({
      userId: user._id,
      fullName: name,
      email: email,
    });

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

// @desc Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid Email or Password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change user password (no authentication, just updates)
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    if (!userId || !newPassword) {
      return res.status(400).json({ message: "userId and newPassword are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc Check if email exists
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Send OTP for password reset
// @route POST /api/auth/send-reset-email
exports.sendResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email not registered" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (10 min)
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email using your verified sender (from .env)
    await sendEmail({
      to: user.email,
      subject: "Your Password Reset OTP",
      html: `
        <h3>Hi ${user.name || "User"},</h3>
        <p>Your password reset OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Error in sendResetEmail:", error);
    res.status(500).json({ success: false, message: "Server error sending reset email." });
  }
};

// @desc Verify OTP for password reset
// @route POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if OTP exists
    if (!user.resetOtp) {
      return res.status(400).json({ 
        success: false, 
        message: "No OTP requested. Please request a new one." 
      });
    }

    // Check if OTP has expired
    if (Date.now() > user.resetOtpExpiry) {
      // Clear expired OTP
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();

      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please request a new one." 
      });
    }

    // Verify OTP
    if (user.resetOtp !== otp.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP. Please try again." 
      });
    }

    // OTP is valid - clear it from DB (one-time use)
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      userId: user._id,
    });

  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error verifying OTP." 
    });
  }
};

// @desc Reset password after OTP verification
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  try {
    // Validate inputs
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, new password, and confirm password are required" 
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    // Validate password strength (optional but recommended)
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email (optional)
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successfully",
      html: `
        <h3>Hi ${user.name || "User"},</h3>
        <p>Your password has been reset successfully.</p>
        <p>If you didn't do this, please contact support immediately.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error resetting password." 
    });
  }
};