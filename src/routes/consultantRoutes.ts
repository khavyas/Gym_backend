import express from "express";
import { protect } from "../middleware/authMiddleware";
import { createConsultant, getConsultants, getConsultantById, updateConsultant, adminOnboardConsultant } from "../controllers/consultantController";

const router = express.Router();

router.post('/admin-onboard', protect, adminOnboardConsultant);
router.post("/", protect, createConsultant);
router.get("/", getConsultants);
router.get("/:id", getConsultantById);
router.put("/", protect, updateConsultant);



export default router;
