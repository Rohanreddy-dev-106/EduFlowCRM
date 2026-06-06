import prisma from "../db/prismaClient.js";

/**
 * GET /api/debug/notification-status - Check notification delivery status
 * Admin only - for debugging purposes
 */
export const getNotificationStatus = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can access debug endpoints",
      });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get overdue prospects in database
    const overdueProspects = await prisma.prospect.findMany({
      where: {
        deletedAt: null,
        stage: { not: "Pilot Closed" },
        nextFollowUpDate: { lt: startOfToday },
      },
      select: {
        id: true,
        name: true,
        school: true,
        stage: true,
        nextFollowUpDate: true,
      },
    });

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    // Get notifications sent today
    const notificationsSentToday = await prisma.notificationLog.findMany({
      where: {
        type: "overdue_prospects",
        createdAt: {
          gte: new Date(startOfToday),
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get unread notifications
    const unreadNotifications = await prisma.notificationLog.findMany({
      where: {
        type: "overdue_prospects",
        read: false,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Notification delivery summary
    const notificationSummary = await prisma.notificationLog.groupBy({
      by: ["userId"],
      where: {
        type: "overdue_prospects",
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
        },
      },
      _count: true,
    });

    return res.json({
      success: true,
      data: {
        currentTime: now,
        startOfToday,
        overdueProspects: {
          count: overdueProspects.length,
          prospects: overdueProspects,
        },
        users: {
          count: users.length,
          users: users,
        },
        notificationDelivery: {
          sentToday: {
            count: notificationsSentToday.length,
            notifications: notificationsSentToday,
          },
          unreadTotal: {
            count: unreadNotifications.length,
            notifications: unreadNotifications,
          },
          last7DaysSummary: notificationSummary,
        },
        verification: {
          "overdue_prospects_in_db": overdueProspects.length,
          "total_users_in_system": users.length,
          "notifications_sent_today": notificationsSentToday.length,
          "expected_emails": users.length > 0 ? overdueProspects.length > 0 ? users.length : 0 : 0,
          "unread_notifications": unreadNotifications.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/debug/test-email - Send a test email to admin
 * Admin only - for debugging purposes
 */
export const sendTestEmail = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can send test emails",
      });
    }

    const { sendEmail, sendOverdueNotificationEmail } = await import("../service/email.service.js");

    // Get some overdue prospects for the test
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const testProspects = await prisma.prospect.findMany({
      where: {
        deletedAt: null,
        stage: { not: "Pilot Closed" },
        nextFollowUpDate: { lt: startOfToday },
      },
      take: 3,
    });

    if (testProspects.length === 0) {
      return res.json({
        success: false,
        message: "No overdue prospects to test with. Create prospects with nextFollowUpDate in the past.",
      });
    }

    const result = await sendOverdueNotificationEmail(req.user.email, testProspects);

    // Log test email in database
    if (result.success) {
      await prisma.notificationLog.create({
        data: {
          userId: req.user.id,
          type: "overdue_prospects",
          title: `TEST: ${testProspects.length} Overdue Follow-ups`,
          message: `[TEST EMAIL] You have ${testProspects.length} prospect(s) with overdue follow-up dates.`,
          metadata: {
            isTest: true,
            prospectCount: testProspects.length,
            prospectIds: testProspects.map((p) => p.id),
          },
          read: false,
        },
      });
    }

    return res.json({
      success: result.success,
      message: result.success
        ? `Test email sent to ${req.user.email}`
        : `Failed to send test email: ${result.error}`,
      data: {
        recipient: req.user.email,
        prospectCount: testProspects.length,
        prospects: testProspects.map((p) => ({ id: p.id, name: p.name, school: p.school })),
        messageId: result.messageId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotificationStatus,
  sendTestEmail,
};
