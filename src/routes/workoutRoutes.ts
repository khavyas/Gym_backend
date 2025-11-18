import express from 'express';
import {
  logWorkout,
  getMyWorkouts,
  getTodayWorkouts,
  getWorkoutStats,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, logWorkout);
router.get('/', protect, getMyWorkouts);
router.get('/today', protect, getTodayWorkouts);
router.get('/stats', protect, getWorkoutStats);
router.put('/:id', protect, updateWorkout);
router.delete('/:id', protect, deleteWorkout);

export default router;