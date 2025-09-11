const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createGym,
  getGyms,
  getGymById,
  updateGym,
  deleteGym,
} = require('../controllers/gymController');

const router = express.Router();

router.route('/')
  .get(getGyms)
  .post(protect, createGym);

router.route('/:id')
  .get(getGymById)
  .put(protect, updateGym)
  .delete(protect, deleteGym);

module.exports = router;
