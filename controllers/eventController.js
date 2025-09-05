const Event = require('../models/Event');

// @desc Create new event
exports.createEvent = async (req, res) => {
  try {
    // Only gym admin can create event
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only gym admins can create events' });
    }

    const { 
      title, 
      description, 
      instructor, 
      cost, 
      benefits, 
      date, 
      location, 
      gymCenter,
      eventType,
      onlineLink
    } = req.body;

    // Validation for online/hybrid
    if ((eventType === 'online' || eventType === 'hybrid') && !onlineLink) {
      return res.status(400).json({ message: 'Online events must include an onlineLink' });
    }

    if ((eventType === 'offline' || eventType === 'hybrid') && !location) {
      return res.status(400).json({ message: 'Offline/Hybrid events must include a location' });
    }

    const event = await Event.create({
      title,
      description,
      instructor,
      cost,
      benefits,
      date,
      location,
      gymCenter,
      eventType,
      onlineLink,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('gymCenter')
      .populate('createdBy', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('gymCenter')
      .populate('createdBy', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only admin or creator can update
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { eventType, onlineLink, location } = req.body;

    // Validation for online/hybrid
    if ((eventType === 'online' || eventType === 'hybrid') && !onlineLink) {
      return res.status(400).json({ message: 'Online events must include an onlineLink' });
    }

    if ((eventType === 'offline' || eventType === 'hybrid') && !location) {
      return res.status(400).json({ message: 'Offline/Hybrid events must include a location' });
    }

    Object.assign(event, req.body);
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Only admin or creator can delete
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
