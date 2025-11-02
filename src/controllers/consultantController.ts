import Consultant from '../models/Consultant.model';
import GymCenter from '../models/Gym.model';
import User from '../models/User.model';
import bcrypt from 'bcrypt'; // or your password hash library


// @desc Admin creates consultant user + profile in one step
export const adminOnboardConsultant = async (req, res) => {
  try {
    const { email, phone, password, gym, ...profileData } = req.body;

    // 1. Validate required fields
    if (!gym) {
      return res.status(400).json({ message: "Gym reference (gym) is required." });
    }
    if (!email || !phone || !password) {
      return res.status(400).json({ message: "Email, phone, and password are required for consultant user creation." });
    }

    // 2. Check if gym exists
    const gymExists = await GymCenter.findById(gym);
    if (!gymExists) {
      return res.status(400).json({ message: "Invalid gym reference." });
    }

    // 3. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    // 4. Hash password and create user with consultant role
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      email,
      phone,
      password: hashedPassword,
      role: 'consultant',
      name: req.body.name
    });

    // 5. Enforce consent and privacy acceptance
    if (!profileData.consent) {
      return res.status(400).json({ message: "Consent is required as per Indian standards/ABDM." });
    }
    if (!profileData.privacyNoticeAccepted) {
      return res.status(400).json({ message: "Privacy notice must be accepted." });
    }

    // 6. Check if consultant profile exists for this user (just in case)
    const existing = await Consultant.findOne({ user: user._id });
    if (existing) {
      return res.status(400).json({ message: "Consultant profile already exists for this user." });
    }

    // 7. Create consultant profile, always attaching to gym and this user
    const consultant = await Consultant.create({
      user: user._id,
      gym: gym,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      ...profileData
    });

    res.status(201).json({
      consultant,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      let errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: err.message });
  }
};


// @desc Create consultant profile
export const createConsultant = async (req, res) => {
  try {
    if (!req.body.gym) {
      return res.status(400).json({ message: "Gym reference (gym) is required." });
    }

    // Verify gym exists
    const gymExists = await GymCenter.findById(req.body.gym);
    if (!gymExists) {
      return res.status(400).json({ message: "Invalid gym reference." });
    }

    // Don't allow multiple consultant profiles per user
    const existing = await Consultant.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Consultant profile already exists for this user." });
    }

    // Enforce consent and privacy acceptance
    if (!req.body.consent) {
      return res.status(400).json({ message: "Consent is required as per Indian standards/ABDM." });
    }

    if (!req.body.privacyNoticeAccepted) {
      return res.status(400).json({ message: "Privacy notice must be accepted." });
    }

    // Attach audit/user fields
    const consultant = await Consultant.create({
      user: req.user._id, // from JWT
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      ...req.body,
    });
    res.status(201).json(consultant);
  } catch (err) {
    // Mongoose validation error handling
    if (err.name === 'ValidationError') {
      let errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: err.message });
  }
};


// @desc Get all consultants
export const getConsultants = async (req, res) => {
  try {
    const consultants = await Consultant.find().populate('user', 'name email role');
    res.json(consultants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Get single consultant
export const getConsultantById = async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('gym', 'name address');
    if (!consultant) return res.status(404).json({ message: 'Consultant not found' });
    res.json(consultant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc Update consultant profile (for logged-in consultant)
export const updateConsultant = async (req, res) => {
  try {
    if (req.body.gym) {
      // Verify gym exists if gym update requested
      const gymExists = await GymCenter.findById(req.body.gym);
      if (!gymExists) {
        return res.status(400).json({ message: "Invalid gym reference." });
      }
    }

    const consultant = await Consultant.findOneAndUpdate(
      { user: req.user._id },  // Only allow updating own profile
      { ...req.body, lastModifiedBy: req.user._id }, // update fields from request body
      { new: true, runValidators: true }
    );

    if (!consultant) {
      return res.status(404).json({ message: "Consultant profile not found" });
    }

    res.json(consultant);
  } catch (err) {
    if (err.name === 'ValidationError') {
      let errors = {};
      for (let field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors });
    }
    res.status(500).json({ message: err.message });
  }
};
