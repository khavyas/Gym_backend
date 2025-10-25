const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  changePassword,
  sendOtp,
  confirmOtp,
  verifyEmail
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", changePassword);
router.post("/send-otp", sendOtp);
router.post("/confirm-otp", confirmOtp);
router.post("/verify-email", verifyEmail);

module.exports = router;
