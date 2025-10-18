// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Consultant = require('../models/Consultant');
const mongoose = require('mongoose');

// helper authorization: owner (user), consultant, or admin/superadmin
const canModify = (reqUser, appointment) => {
  if (!reqUser) return false;
  const uid = String(reqUser._id);
  if (['admin', 'superadmin'].includes(reqUser.role)) return true;
  if (String(appointment.user) === uid) return true;
  if (String(appointment.consultant) === uid) return true;
  return false;
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { consultant: consultantId, startAt, endAt, title, notes, mode, location, price } = req.body;

    if (!consultantId || !startAt) {
      return res.status(400).json({ message: 'consultant and startAt are required' });
    }

    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ message: 'Consultant not found' });

    const appt = await Appointment.create({
      user: req.user._id,
      consultant: new mongoose.Types.ObjectId(consultantId),
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : undefined,
      title,
      notes,
      mode: mode || consultant.modeOfTraining || 'online',
      location,
      price: price !== undefined ? price : (consultant.pricing?.perSession || undefined),
      lastModifiedBy: req.user._id,
      status: 'pending',
    });

    const populated = await Appointment.findById(appt._id)
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get appointments (filters: userId, consultantId, status, from, to)
exports.getAppointments = async (req, res) => {
  try {
    const { userId, consultantId, status, from, to } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (consultantId) filter.consultant = consultantId;
    if (status) filter.status = status;
    if (from || to) {
      filter.startAt = {};
      if (from) filter.startAt.$gte = new Date(from);
      if (to) filter.startAt.$lte = new Date(to);
    }

    // restrict for non-admins: only appointments user is involved in
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      filter.$or = [{ user: req.user._id }, { consultant: req.user._id }];
    }

    const appointments = await Appointment.find(filter)
      .sort({ startAt: 1 })
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single appointment
exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (!canModify(req.user, appt)) return res.status(403).json({ message: 'Forbidden' });

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update appointment (partial)
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (!canModify(req.user, appt)) return res.status(403).json({ message: 'Forbidden' });

    // Prevent non-admins from changing user/consultant
    const updates = { ...req.body };
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      delete updates.user;
      delete updates.consultant;
    }

    if (updates.status) {
      appt.status = updates.status;
      appt.lastModifiedBy = req.user._id;
    }

    const updatable = ['title', 'notes', 'startAt', 'endAt', 'mode', 'location', 'price', 'metadata'];
    updatable.forEach((f) => {
      if (updates[f] !== undefined) appt[f] = updates[f];
    });

    appt.lastModifiedBy = appt.lastModifiedBy || req.user._id;

    await appt.save();

    const populated = await Appointment.findById(appt._id)
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (!canModify(req.user, appt)) return res.status(403).json({ message: 'Forbidden' });

    appt.status = 'cancelled';
    appt.lastModifiedBy = req.user._id;
    await appt.save();

    const populated = await Appointment.findById(appt._id)
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete appointment (hard delete) - allowed to admin or booking user
exports.deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const allowed = req.user.role === 'admin' || req.user.role === 'superadmin' || String(appt.user) === String(req.user._id);
    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    await Appointment.deleteOne({ _id: appt._id });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
