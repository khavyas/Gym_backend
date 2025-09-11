const GymCenter = require('../models/GymCenter');

// @desc Create a new gym
// @route POST /api/gyms
// @access Private (admin only)
exports.createGym = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' });
    }

    const gym = await GymCenter.create({
      name,
      address,
      phone,
      email,
      admin: req.user._id, // link to logged-in admin
    });

    res.status(201).json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all gyms
// @route GET /api/gyms
// @access Public
exports.getGyms = async (req, res) => {
  try {
    const gyms = await GymCenter.find().populate('admin', 'name email');
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get a single gym by ID
// @route GET /api/gyms/:id
// @access Public
exports.getGymById = async (req, res) => {
  try {
    const gym = await GymCenter.findById(req.params.id).populate('admin', 'name email');
    if (!gym) return res.status(404).json({ message: 'Gym not found' });
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a gym
// @route PUT /api/gyms/:id
// @access Private (admin only)
exports.updateGym = async (req, res) => {
  try {
    const gym = await GymCenter.findById(req.params.id);

    if (!gym) return res.status(404).json({ message: 'Gym not found' });

    // Only the admin who created it can update
    if (gym.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gym' });
    }

    gym.name = req.body.name || gym.name;
    gym.address = req.body.address || gym.address;
    gym.phone = req.body.phone || gym.phone;
    gym.email = req.body.email || gym.email;

    const updatedGym = await gym.save();
    res.json(updatedGym);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a gym
// @route DELETE /api/gyms/:id
// @access Private (admin only)
exports.deleteGym = async (req, res) => {
  try {
    const gym = await GymCenter.findById(req.params.id);

    if (!gym) return res.status(404).json({ message: 'Gym not found' });

    if (gym.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gym' });
    }

    await gym.deleteOne();
    res.json({ message: 'Gym removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
