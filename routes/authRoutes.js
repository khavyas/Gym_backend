const express = require("express");
const router = express.Router();
const { registerUser, loginUser, changePassword, checkEmail , sendResetEmail, verifyOtp } = require("../controllers/authController");
const sendEmail = require('../utils/sendEmail');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/change-password', changePassword);
router.post('/check-email', checkEmail);
router.post("/send-reset-email", sendResetEmail);
router.post('/verify-otp', verifyOtp);

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: "khavyameenu@gmail.com",
      subject: "Test Email",
      html: "<h1>Hello from Gym App!</h1>"
    });
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;