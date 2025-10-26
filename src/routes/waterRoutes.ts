const express = require('express');
const { logWaterIntake, getMyWaterIntake, deleteWaterIntake } = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, logWaterIntake);        
router.get('/', protect, getMyWaterIntake);       
router.delete('/:id', protect, deleteWaterIntake);

module.exports = router;
