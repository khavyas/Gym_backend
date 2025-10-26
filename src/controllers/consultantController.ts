import Consultant from '../models/Consultant';

// @desc Create consultant profile
export const createConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.create({
      user: req.user._id, // from JWT
      ...req.body,
    });
    res.status(201).json(consultant);
  } catch (err) {
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
    const consultant = await Consultant.findById(req.params.id).populate('user', 'name email role');
    if (!consultant) return res.status(404).json({ message: 'Consultant not found' });
    res.json(consultant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update consultant profile (for logged-in consultant)
export const updateConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.findOneAndUpdate(
      { user: req.user._id },  // find consultant linked to logged-in user
      { ...req.body },         // update fields from request body
      { new: true, runValidators: true }
    );

    if (!consultant) {
      return res.status(404).json({ message: "Consultant profile not found" });
    }

    res.json(consultant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

