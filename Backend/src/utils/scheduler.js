import cron from "node-cron";
import { checkAndNotifyOverdueProspects } from "../service/notification.service.js";

let scheduledJob = null;

/**
 * Initialize the scheduler for overdue notifications
 * Runs daily at 9 AM (configurable via NOTIFICATION_SCHEDULE env var)
 */
export const initializeScheduler = () => {
  try {
    // Default: Every day at 9 AM
    // Format: "0 9 * * *" (minute, hour, day of month, month, day of week)
    const schedule = process.env.NOTIFICATION_SCHEDULE || "0 9 * * *";

    console.log(`[Scheduler] Initializing notification scheduler with cron: "${schedule}"`);

    scheduledJob = cron.schedule(schedule, async () => {
      console.log(`[Scheduler] Executing overdue prospect check at ${new Date().toISOString()}`);
      const result = await checkAndNotifyOverdueProspects();
      console.log(`[Scheduler] Check result:`, result);
    });

    console.log("[Scheduler] Notification scheduler initialized successfully");
    return { success: true, message: "Scheduler initialized" };
  } catch (error) {
    console.error("[Scheduler] Error initializing scheduler:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Manually trigger overdue prospect check (for testing or immediate execution)
 */
export const triggerOverdueCheck = async () => {
  console.log("[Scheduler] Manual trigger of overdue prospect check");
  return await checkAndNotifyOverdueProspects();
};

/**
 * Stop the scheduler
 */
export const stopScheduler = () => {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob.destroy();
    console.log("[Scheduler] Notification scheduler stopped");
    return { success: true, message: "Scheduler stopped" };
  }
  return { success: false, message: "No scheduler running" };
};

export default {
  initializeScheduler,
  triggerOverdueCheck,
  stopScheduler,
};
