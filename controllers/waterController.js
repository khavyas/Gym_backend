const WaterIntake = require('../models/WaterIntake');

// @desc Log water intake
exports.logWaterIntake = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const entry = await WaterIntake.create({
      user: req.user._id,   // from JWT
      amount,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get today's water intake for logged-in user
exports.getMyWaterIntake = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const history = await WaterIntake.find({
      user: req.user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc Delete a water entry
exports.deleteWaterIntake = async (req, res) => {
  try {
    const entry = await WaterIntake.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // ensure user owns this entry
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await entry.remove();
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
