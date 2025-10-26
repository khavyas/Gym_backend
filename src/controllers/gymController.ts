import GymCenter from "../models/GymCenter";
import User from "../models/User";
import { CreateGymDto } from "../types/gym.dto";


// @desc    Superadmin creates a gym and admin credentials
export const createGym = async (gymDto: CreateGymDto, res) => {
  try {
    const { adminEmail, ...gymData } = gymDto;

    // 1️⃣ Check if admin email already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email does not exist' });
    }

    // 4️⃣ Create gym and link admin
    const gym = await GymCenter.create({ ...gymData, admin: existingAdmin._id });

    res.status(201).json({
      message: 'Gym created successfully',
      gym,
      existingAdmin
    });

  } catch (error) {
    console.error("❌ Error in createGym:", error); // <-- full error stack in Railway logs
    res.status(500).json({
      message: "Server error while creating gym",
      error: error.message, // <-- frontend sees real reason
    });
  }
};

// @desc Get all gyms
// @route GET /api/gyms
// @access Public
export const getGyms = async (req, res) => {
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
export const getGymById = async (req, res) => {
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
export const updateGym = async (req, res) => {
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
export const deleteGym = async (req, res) => {
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
