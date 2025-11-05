import express from 'express';
import { getAdminMetrics as getKPIMetrics } from '../controllers/metricsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/metrics/admin
 * @desc    Get admin dashboard metrics (users, gyms, consultants, revenue)
 * @access  Protected (requires authentication)
 */
router.get('/kpi', protect, getKPIMetrics);

export default router;
