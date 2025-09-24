const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createConsultant, getConsultants, getConsultantById, updateConsultant } = require("../controllers/consultantController");

const router = express.Router();

router.post("/", protect, createConsultant);
router.get("/", getConsultants);
router.get("/:id", getConsultantById);
router.put("/", protect, updateConsultant);  

module.exports = router;
