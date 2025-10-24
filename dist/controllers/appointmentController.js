// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Consultant = require('../models/Consultant');
const mongoose = require('mongoose');
// helper authorization: owner (user), consultant, or admin/superadmin
const canModify = (reqUser, appointment) => {
    if (!reqUser)
        return false;
    const uid = String(reqUser._id);
    if (['admin', 'superadmin'].includes(reqUser.role))
        return true;
    if (String(appointment.user) === uid)
        return true;
    if (String(appointment.consultant) === uid)
        return true;
    return false;
};
// controllers/appointmentController.js (replace createAppointment)
exports.createAppointment = async (req, res) => {
    try {
        const { consultant: consultantId, startAt, endAt, title, notes, mode, location, price } = req.body;
        if (!consultantId || !startAt) {
            return res.status(400).json({ message: 'consultant and startAt are required' });
        }
        // validate consultant exists
        const consultant = await Consultant.findById(consultantId);
        if (!consultant)
            return res.status(404).json({ message: 'Consultant not found' });
        // normalize start/end as Date objects
        const start = new Date(startAt);
        if (isNaN(start.getTime()))
            return res.status(400).json({ message: 'Invalid startAt' });
        const end = endAt ? new Date(endAt) : new Date(start.getTime() + 30 * 60 * 1000); // default 30 min
        if (isNaN(end.getTime()))
            return res.status(400).json({ message: 'Invalid endAt' });
        if (end <= start)
            return res.status(400).json({ message: 'endAt must be after startAt' });
        // 1) Exact duplicate: same user + same consultant + same start time
        const exactDuplicate = await Appointment.findOne({
            user: req.user._id,
            consultant: consultantId,
            startAt: start,
        });
        if (exactDuplicate) {
            return res.status(409).json({ message: 'You already have a booking for this timeslot' });
        }
        // 2) Overlap check for consultant:
        // find any appointment for the consultant that overlaps the requested window
        // consider statuses that block the slot
        const blockingStatuses = ['pending', 'confirmed', 'rescheduled'];
        const overlap = await Appointment.findOne({
            consultant: consultantId,
            status: { $in: blockingStatuses },
            $or: [
                // existing.start < new.end && existing.end > new.start  (overlap)
                { startAt: { $lt: end }, endAt: { $gt: start } },
                // existing.start inside new range
                { startAt: { $gte: start, $lt: end } }
            ],
        });
        if (overlap) {
            // If overlap exists and is by the same user, give a specific message
            if (String(overlap.user) === String(req.user._id)) {
                return res.status(409).json({ message: 'You already have an overlapping appointment at this time' });
            }
            return res.status(409).json({ message: 'Selected timeslot is already booked' });
        }
        // All clear — create appointment
        const appt = await Appointment.create({
            user: req.user._id,
            consultant: new mongoose.Types.ObjectId(consultantId),
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
    }
    catch (err) {
        console.error('createAppointment error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};
// Get appointments (filters: userId, consultantId, status, from, to)
exports.getAppointments = async (req, res) => {
    try {
        const { userId, consultantId, status, from, to } = req.query;
        const filter = {};
        if (userId)
            filter.user = userId;
        if (consultantId)
            filter.consultant = consultantId;
        if (status)
            filter.status = status;
        if (from || to) {
            filter.startAt = {};
            if (from)
                filter.startAt.$gte = new Date(from);
            if (to)
                filter.startAt.$lte = new Date(to);
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
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get single appointment
exports.getAppointmentById = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id)
            .populate('user', 'name email')
            .populate('consultant', 'name specialty contact');
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        if (!canModify(req.user, appt))
            return res.status(403).json({ message: 'Forbidden' });
        res.json(appt);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Update appointment (partial)
exports.updateAppointment = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        if (!canModify(req.user, appt))
            return res.status(403).json({ message: 'Forbidden' });
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
            if (updates[f] !== undefined)
                appt[f] = updates[f];
        });
        appt.lastModifiedBy = appt.lastModifiedBy || req.user._id;
        await appt.save();
        const populated = await Appointment.findById(appt._id)
            .populate('user', 'name email')
            .populate('consultant', 'name specialty contact');
        res.json(populated);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        if (!canModify(req.user, appt))
            return res.status(403).json({ message: 'Forbidden' });
        appt.status = 'cancelled';
        appt.lastModifiedBy = req.user._id;
        await appt.save();
        const populated = await Appointment.findById(appt._id)
            .populate('user', 'name email')
            .populate('consultant', 'name specialty contact');
        res.json(populated);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Delete appointment (hard delete) - allowed to admin or booking user
exports.deleteAppointment = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt)
            return res.status(404).json({ message: 'Appointment not found' });
        const allowed = req.user.role === 'admin' || req.user.role === 'superadmin' || String(appt.user) === String(req.user._id);
        if (!allowed)
            return res.status(403).json({ message: 'Forbidden' });
        await Appointment.deleteOne({ _id: appt._id });
        res.json({ message: 'Appointment deleted' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
