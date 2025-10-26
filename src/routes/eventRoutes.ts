import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';

// Public
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
