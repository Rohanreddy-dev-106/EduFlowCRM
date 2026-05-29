import prisma from "../db/prismaClient.js";

const CHECKLIST_STEPS = [
    "School KYC completed",
    "Admin account created",
    "Teachers onboarded",
    "Student data uploaded",
    "Class structure setup",
    "Fee module configured",
    "Attendance module enabled",
    "Timetable created",
    "Training session completed",
    "Go-live confirmation"
];

export const createOnboardingChecklist = async (prospectId, tx = null) => {
    const checklistDocs = CHECKLIST_STEPS.map((title, index) => ({
        prospectId,
        stepNumber: index + 1,
        title,
        description: title,
        assignee: "KALNET Ops",
        status: "todo",
        dueDate: new Date(Date.now() + (index + 1) * 86400000)
    }));

    if (tx) {
        return await tx.onboardingChecklist.createMany({
            data: checklistDocs,
            skipDuplicates: true
        });
    }

    return await prisma.onboardingChecklist.createMany({
        data: checklistDocs,
        skipDuplicates: true
    });
};