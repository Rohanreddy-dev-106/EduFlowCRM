import prisma from "../db/prismaClient.js";

/**
 * Checks if all checklist items for a prospect are completed
 * If so, marks the prospect as completed
 * @param {string} prospectId - The prospect ID
 * @returns {Promise<{completed: boolean, completedAt: Date|null}>}
 */
export async function checkAndUpdateProspectCompletion(prospectId) {
  try {
    // Get all checklist items for this prospect
    const checklistItems = await prisma.onboardingChecklist.findMany({
      where: { prospectId },
      select: { id: true, status: true },
    });

    if (checklistItems.length === 0) {
      // No checklist items, don't mark as completed
      return { completed: false, completedAt: null };
    }

    // Check if all items are done
    const allCompleted = checklistItems.every((item) => item.status === "done");

    if (allCompleted) {
      // Update prospect as completed
      const updated = await prisma.prospect.update({
        where: { id: prospectId },
        data: {
          completed: true,
          completedAt: new Date(),
        },
        select: {
          completed: true,
          completedAt: true,
        },
      });

      return updated;
    } else {
      // If not all completed, ensure the prospect is marked as not completed
      await prisma.prospect.update({
        where: { id: prospectId },
        data: {
          completed: false,
          completedAt: null,
        },
      });

      return { completed: false, completedAt: null };
    }
  } catch (error) {
    console.error(`Error checking completion status for prospect ${prospectId}:`, error);
    throw error;
  }
}

/**
 * Batch check completion status for multiple prospects
 * @param {string[]} prospectIds - Array of prospect IDs
 * @returns {Promise<Array>}
 */
export async function checkAndUpdateBatchCompletion(prospectIds) {
  try {
    const results = await Promise.all(
      prospectIds.map((id) => checkAndUpdateProspectCompletion(id))
    );
    return results;
  } catch (error) {
    console.error("Error batch checking completion status:", error);
    throw error;
  }
}

/**
 * Get completion progress for a prospect
 * @param {string} prospectId - The prospect ID
 * @returns {Promise<{completed: number, total: number, percentage: number}>}
 */
export async function getCompletionProgress(prospectId) {
  try {
    const items = await prisma.onboardingChecklist.findMany({
      where: { prospectId },
      select: { status: true },
    });

    const total = items.length;
    const completed = items.filter((item) => item.status === "done").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  } catch (error) {
    console.error(`Error getting completion progress for prospect ${prospectId}:`, error);
    throw error;
  }
}
