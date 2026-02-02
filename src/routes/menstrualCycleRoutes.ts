import express from 'express';
import { 
  enableTracking, 
  logPeriod, 
  getCycleInsights, 
  updateNotifications,
  disableTracking
} from '../controllers/menstrualCycleController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Enable tracking
router.post('/enable', enableTracking);

// Disable tracking
router.post('/disable', disableTracking);

// Log a new period
router.post('/log-period', logPeriod);

// Get cycle insights
router.get('/insights', getCycleInsights);

// Update notification settings
router.put('/notifications', updateNotifications);

export default router;




// import express from 'express';
// import { 
//   enableTracking, 
//   logPeriod, 
//   getCycleInsights, 
//   updateNotifications 
// } from '../controllers/menstrualCycleController'; 
// import { protect } from '../middleware/authMiddleware';

// const router = express.Router();

// // All routes require authentication
// router.use(protect);

// // Enable tracking
// router.post('/enable', enableTracking);

// // Log a new period
// router.post('/log-period', logPeriod);

// // Get cycle insights
// router.get('/insights', getCycleInsights);

// // Update notification settings
// router.put('/notifications', updateNotifications);

// export default router;