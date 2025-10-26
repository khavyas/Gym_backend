import express from "express";
const router = express.Router();
import { getProfile, updateProfile } from "../controllers/profileController";

router.get("/:userId", getProfile);
router.put("/:userId", updateProfile);

export default router;
