import express from "express";
import {
  getNotifications,
  getUnreadCountEndpoint,
  markAsRead,
  triggerOverdueCheckEndpoint,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(requireAuth);

// GET notifications
router.get("/", getNotifications);

// GET unread count
router.get("/unread-count", getUnreadCountEndpoint);

// PATCH mark as read
router.patch("/:id/read", markAsRead);

// POST trigger manual overdue check (admin only)
router.post("/trigger-check", triggerOverdueCheckEndpoint);

export default router;
