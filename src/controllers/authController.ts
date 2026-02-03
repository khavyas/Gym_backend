import { AuthRequest } from "../types/request-response.dto";
import { RegisterAdminDto, LoginUserDto, RegisterUserDto, GetUsersQueryDto } from "../types/user.dto";
import User from '../models/User.model';
import Profile from '../models/Profile.model';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken';
import Otp from '../models/Otp.model';
import { Request } from "express";

const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60000;

// ============================================
// NEW USER REGISTRATION (with automatic Profile creation)
// ============================================
export const registerUser = async (req: AuthRequest<RegisterUserDto>, res) => {
  console.log("Incoming registration body:", req.body);

  const {
    name, age, phone, email, password, role,
    consent, privacyNoticeAccepted, aadharNumber, abhaId, weight,
    gym, specialty, description, gender, yearsOfExperience,
    certifications, modeOfTraining, location, website,
    ...rest
  } = req.body;

  try {
    let filters = [];
    if (email) filters.push({ email: email.toLowerCase().trim() });
    if (phone) filters.push({ phone: phone.trim() });

    if (filters.length > 0) {
      const userExists = await User.findOne({ $or: filters });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATE USER
    const user = await User.create({
      name,
      age,
      gender,
      weight,
      phone: phone,
      email: email,
      password: hashedPassword,
      role,
      consent,
      privacyNoticeAccepted,
      aadharNumber,
      abhaId,
      ...rest
    });

    // ✅ AUTOMATICALLY CREATE PROFILE FOR THE USER WITH SYNCED DATA
    try {
      const newProfile = await Profile.create({
        userId: user._id,
        fullName: name,
        email: email,
        phone: phone || "",
        bio: "",
        profileImage: null,
        dateOfBirth: "",
        aadharNumber: aadharNumber || "",
        abhaId: abhaId || "",
        healthMetrics: {
          weight: weight?.toString() || "", // ✅ FIX: Sync weight from registration
          height: "",
          age: age?.toString() || "",
          gender: gender || "male", // ✅ Already syncing gender
          fitnessGoal: "general_fitness"
        },
        workPreferences: {
          occupation: "other",
          workoutTiming: "morning",
          availableDays: [],
          workStressLevel: "medium",
          sedentaryHours: "6-8",
          workoutLocation: "gym"
        },
        notifications: {
          workoutReminders: true,
          newContent: true,
          promotionOffers: false,
          appointmentReminders: true
        },
        security: {
          biometricLogin: false,
          twoFactorAuth: false
        },
        address: {
          street: "",
          city: "",
          state: "",
          pincode: ""
        },
        membershipStatus: "trial",
        badgeCount: 0,
        achievements: [],
        logincount: 0
      });

      console.log("✅ Profile created automatically for user:", user._id);
      console.log("✅ Synced data - Gender:", gender, "Weight:", weight, "Age:", age);
    } catch (profileError) {
      console.error("⚠️ Failed to create profile, but user was created:", profileError);
    }

    // ✅ IF ROLE IS CONSULTANT, CREATE CONSULTANT PROFILE TOO
    if (role === 'consultant') {
      try {
        if (gym) {
          const GymCenter = require('../models/Gym.model').default;
          const gymExists = await GymCenter.findById(gym);
          if (!gymExists) {
            console.error("⚠️ Invalid gym ID provided during consultant registration");
          }
        }

        const Consultant = require('../models/Consultant.model').default;
        
        const consultantData = {
          user: user._id,
          gym: gym || '6782ba6ab378969cb55dde21',
          name: name,
          specialty: specialty || 'General Consultant',
          description: description || '',
          gender: gender || undefined,
          yearsOfExperience: yearsOfExperience || 0,
          certifications: certifications || [],
          modeOfTraining: modeOfTraining || 'online',
          contact: {
            phone: phone || '',
            email: email || '',
            location: location || '',
            website: website || ''
          },
          consent: consent ?? true,
          privacyNoticeAccepted: privacyNoticeAccepted ?? true,
          createdBy: user._id,
          lastModifiedBy: user._id
        };

        const consultantProfile = await Consultant.create(consultantData);

        console.log("✅ Consultant profile created automatically:", consultantProfile._id);
        
        return res.status(201).json({
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,       
          weight: user.weight,             
          gender: user.gender, 
          token: generateToken(user._id),
          consultantId: consultantProfile._id,
          gymId: gym || null
        });
        
      } catch (consultantError) {
        console.error("⚠️ Failed to create consultant profile:", consultantError.message);
        console.error("Full error:", consultantError);
        
        return res.status(201).json({
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,                          
          weight: user.weight,                        
          gender: user.gender, 
          token: generateToken(user._id),
          warning: 'User created but consultant profile needs to be completed',
          error: consultantError.message
        });
      }
    }

    // For non-consultant users
    res.status(201).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,       
      weight: user.weight,     
      gender: user.gender,  
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Register new admin (with automatic Profile creation)
export const registerAdmin = async (req: AuthRequest<RegisterAdminDto>, res) => {
  console.log("Incoming admin registration body:", req.body);

  const { name, age, phone, email, password, gender } = req.body;

  try {
    const adminExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return res.status(400).json({ message: 'User with this phone number already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      age,
      gender: gender || "male",
      phone: phone,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      consent: true,
      privacyNoticeAccepted: true,
      emailVerified: true,
      phoneVerified: phone ? true : false,
    });

    // ✅ AUTOMATICALLY CREATE PROFILE FOR ADMIN
    try {
      await Profile.create({
        userId: admin._id,
        fullName: name,
        email: email.toLowerCase().trim(),
        phone: phone || "",
        bio: "System Administrator",
        profileImage: null,
        healthMetrics: {
          weight: "",
          height: "",
          age: age?.toString() || "",
          gender: gender || "male",
          fitnessGoal: "general_fitness"
        },
        membershipStatus: "active",
        badgeCount: 0,
        achievements: [],
        logincount: 0
      });

      console.log("✅ Profile created automatically for admin:", admin._id);
    } catch (profileError) {
      console.error("⚠️ Failed to create profile for admin:", profileError);
    }

    res.status(201).json({
      userId: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      age: admin.age,
      gender: admin.gender,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// VERIFY OTP AND CREATE USER (Step 2)
// ============================================
export const verifyOtpAndRegister = async (req, res) => {
  const { phone, email, otp, name, age, role, aadharNumber, abhaId, password, gender, weight } = req.body;

  try {
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

    let filters = [];
    if (email) filters.push({ email });
    if (phone) filters.push({ phone });
    const userExists = await User.findOne({ $or: filters });
    if (userExists) {
      return res.status(400).json({ message: 'User already registered' });
    }

    let userData: any = {
      name,
      age,
      gender,
      weight,
      phone,
      email,
      role: role || 'user',
      consent: true,
      privacyNoticeAccepted: true,
      aadharNumber,
      abhaId,
      isVerified: true
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.create(userData);

    // ✅ CREATE PROFILE AFTER OTP VERIFICATION
    try {
      await Profile.create({
        userId: user._id,
        fullName: name,
        email: email,
        phone: phone || "",
        bio: "",
        profileImage: null,
        dateOfBirth: "",
        aadharNumber: aadharNumber || "",
        abhaId: abhaId || "",
        healthMetrics: {
          weight: weight?.toString() || "",
          height: "",
          age: age?.toString() || "",
          gender: gender || "male",
          fitnessGoal: "general_fitness"
        },
        membershipStatus: "trial",
        badgeCount: 0,
        achievements: [],
        logincount: 0
      });

      console.log("✅ Profile created after OTP verification for user:", user._id);
    } catch (profileError) {
      console.error("⚠️ Failed to create profile after OTP verification:", profileError);
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: user._id,
      age: user.age,            
      weight: user.weight,         
      gender: user.gender,
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
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user.toObject(),
      aadharNumber: maskAadhaar(user.aadharNumber),
      abhaId: maskAbha(user.abhaId),
      phone: user.phone ? "XXXXXX" + user.phone.slice(-4) : undefined,
      password: undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// LOGIN USER
// ============================================
export const loginUser = async (req: AuthRequest<LoginUserDto>, res) => {
  const { email, phone, password, identifier } = req.body;

  try {
    const query: any = {};

    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    } else if (identifier) {
      if (/^\d+$/.test(identifier)) {
        query.phone = identifier;
      } else {
        query.email = identifier.toLowerCase();
      }
    }

    const user = await User.findOne(query);

    if (!user) {
      console.log("❌ User not found with query:", query);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      console.log("❌ User has no password set");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Password mismatch for user:", user.email || user.phone);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Login successful");

    return res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      age: user.age,           
      weight: user.weight,     
      gender: user.gender,     
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ message: "User ID and new password are required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { runValidators: false }
    );

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOtp = async (req, res) => {
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

    res.json({ success: true, message: "OTP sent", otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "Email not registered" });

  const otpRecord = await Otp.findOne({ email, otp, userid: user._id });
  const isValid = otpRecord && user.otp === otp;
  res.json({ success: isValid, message: isValid ? "OTP verified" : "OTP invalid" });
};

export const getMe = async (req: AuthRequest, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user information'
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.json({ success: true, message: "Email registered" });
  } else {
    res.json({ success: false, message: "Email not registered" });
  }
};

export const getAllUsers = async (req: AuthRequest, res) => {
  try {
    const query = req.query as unknown as GetUsersQueryDto;

    const {
      id,
      name,
      email,
      phone,
      role,
      gender,
      emailVerified,
      phoneVerified,
      oauthProvider,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const filter: any = {};

    if (id) filter._id = id;
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (email) filter.email = email;
    if (phone) filter.phone = phone;
    if (role) filter.role = role;
    if (gender) filter.gender = gender;
    if (emailVerified !== undefined) filter.emailVerified = emailVerified;
    if (phoneVerified !== undefined) filter.phoneVerified = phoneVerified;
    if (oauthProvider) filter.oauthProvider = oauthProvider;

    const skip = (page - 1) * limit;

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .select('-password -otp -otpAttempts')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};