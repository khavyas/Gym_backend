import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createGym,
    getGyms,
    getGymById,
    updateGym,
    deleteGym,
    getNearbyGyms
} from '../controllers/gymController';

const router = express.Router();

router.route('/')
    .get(getGyms)
    .post(protect, createGym);

// NEW Route for discovery/search
router.get('/nearby', getNearbyGyms);

router.route('/:id')
    .get(getGymById)
    .put(protect, updateGym)
    .delete(protect, deleteGym);

export default router;
