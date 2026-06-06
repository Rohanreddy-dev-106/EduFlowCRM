import express from "express";
import { getNotificationStatus, sendTestEmail } from "../controllers/debug.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// All debug routes require authentication
router.use(requireAuth);

// Get notification delivery status (admin only)
router.get("/notification-status", getNotificationStatus);

// Send a test email (admin only)
router.post("/test-email", sendTestEmail);

export default router;
