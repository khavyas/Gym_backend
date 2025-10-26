// routes/appointmentRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

const router = express.Router();

// Protect all appointment routes
router.use(protect);

router.post('/', createAppointment);            // create
router.get('/', getAppointments);               // list with optional filters
router.get('/:id', getAppointmentById);         // get single
router.patch('/:id', updateAppointment);        // update partial
router.post('/:id/cancel', cancelAppointment);  // cancel (sets status)
router.delete('/:id', deleteAppointment);       // delete

module.exports = router;
