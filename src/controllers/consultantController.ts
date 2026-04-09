import Consultant from '../models/Consultant.model';
import GymCenter from '../models/Gym.model';
import User from '../models/User.model';
import bcrypt from 'bcrypt'; // or your password hash library
import { AuthRequest } from '../types/request-response.dto';
import { GetConsultantsQueryDto, RegisterConsultantDto } from '../types/user.dto';
import sendEmail from '../utils/sendEmail';
import generateToken from '../utils/generateToken';

export const registerConsultant = async (req: AuthRequest<RegisterConsultantDto>, res) => {
  console.log("Incoming consultant registration body:", req.body);

  let {
    name, age, phone, email, password,
    consent, privacyNoticeAccepted, aadharNumber, abhaId, weight,
    gym, domain, specialty, description, meetingLink, gender, yearsOfExperience,
    certifications, modeOfTraining, location, website,
    isHiwoxMember
  } = req.body;

  try {
    let filters = [];
    if (email) filters.push({ email: email.toLowerCase().trim() });
    if (phone) filters.push({ phone: phone.trim() });
    let resolvedDomainIds = [];

    if (filters.length > 0) {
      const userExists = await User.findOne({ $or: filters });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    // If domains are provided, validate them by domainId and collect their _ids
    if (domain?.length) {
      const Domain = require('../models/Domain.model').default;
      const normalizedDomainIds = [...new Set(domain.map((domainId) => domainId.trim()).filter(Boolean))];
      const domainDocs = await Domain.find({ domainId: { $in: normalizedDomainIds } }).select('_id domainId');

      if (domainDocs.length !== normalizedDomainIds.length) {
        const foundDomainIds = new Set(domainDocs.map((domainDoc) => domainDoc.domainId));
        const invalidDomainIds = normalizedDomainIds.filter((domainId) => !foundDomainIds.has(domainId));

        return res.status(400).json({
          message: `Invalid domainId provided during consultant registration: ${invalidDomainIds.join(', ')}`
        });
      }

      resolvedDomainIds = domainDocs.map((domainDoc) => domainDoc._id);
    }

    if (!password) {
      password = Math.random().toString(36).slice(-8); // Generate a random 8-character password
      if (isHiwoxMember) {
        sendEmail({
          to: email,
          subject: "Welcome to Hiwox - Your Account Details",
          html: `<p>Dear ${name},</p>
                 <p>Welcome to Hiwox! Your account has been created successfully.</p>
                 <p><strong>Your temporary password is:</strong> ${password}</p>
                 <p>Please log in and change your password immediately for security reasons.</p>
                 <p>Best regards,<br/>Hiwox Team</p>`
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = 'consultant';

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
      abhaId
    });

    try {
      if (gym) {
        const GymCenter = require('../models/Gym.model').default;
        const gymExists = await GymCenter.findById(gym);
        if (!gymExists) {
          console.error("⚠️ Invalid gym ID provided during consultant registration");
        }
      }

      const Consultant = require('../models/Consultant.model').default;
      const consultantContact: any = {};

      if (website) {
        consultantContact.website = website;
      }

      if (location) {
        consultantContact.location = { city: location };
      }

      const consultantData = {
        user: user._id,
        gym: gym || undefined,
        domain: resolvedDomainIds,
        specialty: specialty || 'General Consultant',
        description: description || '',
        meetingLink: meetingLink || '',
        yearsOfExperience: yearsOfExperience || 0,
        certifications: certifications || [],
        modeOfTraining: modeOfTraining || 'online',
        contact: consultantContact,
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
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getConsultants = async (
  req: AuthRequest,
  res
) => {
  try {
    const query = req.query as unknown as GetConsultantsQueryDto;

    const {
      id,
      userId,
      name,
      email,
      phone,
      gender,
      emailVerified,
      phoneVerified,
      oauthProvider,
      gym,
      domain,
      specialty,
      modeOfTraining,
      isVerified,
      verified,
      minYearsOfExperience,
      maxYearsOfExperience,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const filter: any = {};
    const userFilter: any = { role: 'consultant' };

    if (id) filter._id = id;
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (gym) filter.gym = gym;
    if (domain) filter.domain = domain;
    if (modeOfTraining) filter.modeOfTraining = modeOfTraining;

    const consultantVerification = isVerified ?? verified;
    if (consultantVerification !== undefined) {
      filter.isVerified = consultantVerification;
    }

    if (minYearsOfExperience !== undefined || maxYearsOfExperience !== undefined) {
      filter.yearsOfExperience = {};

      if (minYearsOfExperience !== undefined) {
        filter.yearsOfExperience.$gte = minYearsOfExperience;
      }

      if (maxYearsOfExperience !== undefined) {
        filter.yearsOfExperience.$lte = maxYearsOfExperience;
      }
    }

    if (userId) userFilter._id = userId;
    if (name) userFilter.name = { $regex: name, $options: 'i' };
    if (email) userFilter.email = email;
    if (phone) userFilter.phone = phone;
    if (gender) userFilter.gender = gender;
    if (emailVerified !== undefined) userFilter.emailVerified = emailVerified;
    if (phoneVerified !== undefined) userFilter.phoneVerified = phoneVerified;
    if (oauthProvider) userFilter.oauthProvider = oauthProvider;

    const matchedUsers = await User.find(userFilter).select('_id').lean();
    filter.user = { $in: matchedUsers.map((user) => user._id) };

    if (matchedUsers.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: page > 1
        }
      });
    }

    const skip = (page - 1) * limit;

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const consultants = await Consultant.find(filter)
      .populate('user', '-password -otp -otpAttempts')
      .populate('gym')
      .populate('domain')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Consultant.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: consultants,
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
    console.error('Get all consultants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching consultants'
    });
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
