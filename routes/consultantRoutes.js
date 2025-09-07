const express = require('express');
const {
  createConsultant,
  getConsultants,
  getConsultantById,
} = require('../controllers/consultantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createConsultant);   // consultants can create profile
router.get('/', getConsultants);              // list all consultants
router.get('/:id', getConsultantById);        // single consultant profile

module.exports = router;
