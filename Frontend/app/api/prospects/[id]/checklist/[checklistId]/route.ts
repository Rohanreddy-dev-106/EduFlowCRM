// app/api/prospects/[id]/checklist/[checklistId]/route.ts — Prisma-backed checklist endpoint
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; checklistId: string } }
) {
  const auth = await requireAuth(["admin", "manager"]);
  if (!auth.ok) return auth.response;

  try {
    const { status } = await req.json();
    if (status !== "TODO" && status !== "DONE") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const item = await prisma.onboardingChecklist.findUnique({
      where: { id: params.checklistId },
      include: {
        prospect: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!item || item.prospectId !== params.id || item.prospect.deletedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update the checklist item
      const checklistItem = await tx.onboardingChecklist.update({
        where: { id: params.checklistId },
        data: { status: status === "DONE" ? "done" : "todo" },
      });

      // Check if all checklist items are now completed
      const allItems = await tx.onboardingChecklist.findMany({
        where: { prospectId: params.id },
        select: { status: true },
      });

      const allCompleted = allItems.length > 0 && allItems.every((i) => i.status === "done");

      if (allCompleted) {
        // Mark prospect as completed
        await tx.prospect.update({
          where: { id: params.id },
          data: {
            completed: true,
            completedAt: new Date(),
          },
        });
      } else {
        // Reset completion if not all items are done
        await tx.prospect.update({
          where: { id: params.id },
          data: {
            completed: false,
            completedAt: null,
          },
        });
      }

      return checklistItem;
    });

    // Get updated completion status
    const prospect = await prisma.prospect.findUnique({
      where: { id: params.id },
      select: {
        completed: true,
        completedAt: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      prospectId: updated.prospectId,
      stepNumber: updated.stepNumber,
      title: updated.title,
      description: updated.description || "",
      assignee: updated.assignee || "",
      status: updated.status === "done" ? "DONE" : "TODO",
      dueDate: updated.dueDate || null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt || updated.createdAt,
      prospectCompletion: prospect,
    });
  } catch (err) {
    console.error("PATCH checklist error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
