const User = require('../models/User');
const Profile = require('../models/Profile'); // <-- import Profile model
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

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
