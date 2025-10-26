import express from 'express';
import { logWaterIntake, getMyWaterIntake, deleteWaterIntake } from '../controllers/waterController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, logWaterIntake);
router.get('/', protect, getMyWaterIntake);
router.delete('/:id', protect, deleteWaterIntake);

export default router;
