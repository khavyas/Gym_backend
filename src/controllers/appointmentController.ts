// controllers/appointmentController.js
import Appointment from '../models/Appointment.model';
import Consultant from '../models/Consultant.model';
import mongoose from 'mongoose';

// ✅ FIXED: Updated authorization helper
const canModify = async (reqUser, appointment) => {
  if (!reqUser) return false;
  const uid = String(reqUser._id);
  
  // Admins can always modify
  if (['admin', 'superadmin'].includes(reqUser.role)) return true;
  
  // User who created the appointment can modify
  if (String(appointment.user) === uid) return true;
  
  // ✅ FIX: Check if the logged-in user is the consultant for this appointment
  // Need to find the consultant document and check its user field
  const consultant = await Consultant.findById(appointment.consultant);
  if (consultant && String(consultant.user) === uid) return true;
  
  return false;
};

// Create appointment (unchanged)
export const createAppointment = async (req, res) => {
  try {
    const { consultant: consultantId, startAt, endAt, title, notes, mode, location, price } = req.body;

    if (!consultantId || !startAt) {
      return res.status(400).json({ message: 'consultant and startAt are required' });
    }

    const consultant = await Consultant.findById(consultantId);
    if (!consultant) return res.status(404).json({ message: 'Consultant not found' });

    const start = new Date(startAt);
    if (isNaN(start.getTime())) return res.status(400).json({ message: 'Invalid startAt' });

    const end = endAt ? new Date(endAt) : new Date(start.getTime() + 30 * 60 * 1000);
    if (isNaN(end.getTime())) return res.status(400).json({ message: 'Invalid endAt' });
    if (end <= start) return res.status(400).json({ message: 'endAt must be after startAt' });

    const exactDuplicate = await Appointment.findOne({
      user: req.user._id,
      consultant: consultantId,
      startAt: start,
    });
    if (exactDuplicate) {
      return res.status(409).json({ message: 'You already have a booking for this timeslot' });
    }

    const blockingStatuses = ['pending', 'confirmed', 'rescheduled'];
    const overlap = await Appointment.findOne({
      consultant: consultantId,
      status: { $in: blockingStatuses },
      $or: [
        { startAt: { $lt: end }, endAt: { $gt: start } },
        { startAt: { $gte: start, $lt: end } }
      ],
    });

    if (overlap) {
      if (String(overlap.user) === String(req.user._id)) {
        return res.status(409).json({ message: 'You already have an overlapping appointment at this time' });
      }
      return res.status(409).json({ message: 'Selected timeslot is already booked' });
    }

    const appt = await Appointment.create({
      user: req.user._id,
      consultant: consultantId, 
      startAt: start,
      endAt: end,
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

    return res.status(201).json(populated);
  } catch (err) {
    console.error('createAppointment error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get appointments (unchanged)
export const getAppointments = async (req, res) => {
  try {
    const { userId, consultantId, status, from, to } = req.query;
    const filter = {};

    if (userId) filter['user'] = userId;
    if (consultantId) filter['consultant'] = consultantId;
    if (status) filter['status'] = status;
    if (from || to) {
      filter['startAt'] = {};
      if (from) filter['startAt'].$gte = new Date(from);
      if (to) filter['startAt'].$lte = new Date(to);
    }

    if (!['admin', 'superadmin'].includes(req.user.role)) {
      if (consultantId) {
        const consultant = await Consultant.findById(consultantId);
        if (!consultant) {
          return res.status(404).json({ message: 'Consultant not found' });
        }
        
        if (String(consultant.user) !== String(req.user._id)) {
          return res.status(403).json({ message: 'Access denied to this consultant' });
        }
      } else {
        const userConsultants = await Consultant.find({ user: req.user._id });
        const consultantIds = userConsultants.map(c => c._id);
        
        filter['$or'] = [
          { user: req.user._id },
          { consultant: { $in: consultantIds } }
        ];
      }
    }

    const appointments = await Appointment.find(filter)
      .sort({ startAt: 1 })
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    res.json(appointments);
  } catch (err) {
    console.error('getAppointments error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('consultant', 'name specialty contact');

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const canEdit = await canModify(req.user, appt);
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ IMPROVED: Update appointment with better status validation
export const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const canEdit = await canModify(req.user, appt);
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    const updates = { ...req.body };
    
    // Prevent non-admins from changing user/consultant
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      delete updates.user;
      delete updates.consultant;
    }

    // ✅ NEW: Validate status transitions
    if (updates.status) {
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['rescheduled', 'completed', 'cancelled'],
        rescheduled: ['confirmed', 'cancelled'],
        completed: [], // Cannot change from completed
        cancelled: [], // Cannot change from cancelled
      };

      const allowedStatuses = validTransitions[appt.status] || [];
      
      if (!allowedStatuses.includes(updates.status) && !['admin', 'superadmin'].includes(req.user.role)) {
        return res.status(400).json({ 
          message: `Cannot change status from ${appt.status} to ${updates.status}` 
        });
      }

      appt.status = updates.status;
      appt.lastModifiedBy = req.user._id;
    }

    // Update other fields
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
    console.error('updateAppointment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const canEdit = await canModify(req.user, appt);
    if (!canEdit) return res.status(403).json({ message: 'Forbidden' });

    // ✅ NEW: Check if already completed or cancelled
    if (appt.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }
    if (appt.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

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

// Delete appointment
export const deleteAppointment = async (req, res) => {
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