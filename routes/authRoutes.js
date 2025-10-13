const express = require("express");
const router = express.Router();
const { registerUser, loginUser, changePassword, checkEmail , sendResetEmail} = require("../controllers/authController");

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/change-password', changePassword);
router.post('/check-email', checkEmail);
router.post("/send-reset-email", sendResetEmail);

module.exports = router;