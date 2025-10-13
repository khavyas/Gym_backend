const express = require("express");
const router = express.Router();
const { registerUser, loginUser, changePassword, checkEmail } = require("../controllers/authController");

router.post('/register', registerUser);
router.post('/login', loginUser);

// Check if email exists
router.post('/check-email', checkEmail);

module.exports = router;