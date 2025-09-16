const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/:userId", getProfile);
router.put("/:userId", updateProfile);

module.exports = router;
