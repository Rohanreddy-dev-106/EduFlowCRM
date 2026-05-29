import prisma from "../db/prismaClient.js";
import { createOnboardingChecklist } from "../utils/onbord.chicklist.js";

export const createCardService = async (payload) => {
    return prisma.$transaction(async (tx) => {
        const created = await tx.prospect.create({
            data: {
                name: payload.name,
                school: payload.school,
                role: payload.role || null,
                email: payload.email || null,
                phone: payload.phone || null,
                source: payload.source || "Direct",
                stage: payload.stage || "Cold",
                lastContactDate: payload.lastContactDate ? new Date(payload.lastContactDate) : null,
                nextFollowUpDate: payload.nextFollowUpDate ? new Date(payload.nextFollowUpDate) : null
            }
        });

        if (created.stage === "Pilot Closed") {
            await createOnboardingChecklist(created.id, tx);
        }

        return created;
    });
};

export const updateCardService = async (cardId, payload) => {
    const data = {
        ...payload
    };

    if (Object.prototype.hasOwnProperty.call(data, "lastContactDate")) {
        data.lastContactDate = data.lastContactDate ? new Date(data.lastContactDate) : null;
    }

    if (Object.prototype.hasOwnProperty.call(data, "nextFollowUpDate")) {
        data.nextFollowUpDate = data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null;
    }

    return prisma.$transaction(async (tx) => {
        const existing = await tx.prospect.findUnique({
            where: { id: cardId }
        });
        if (!existing) throw new Error("Card not found");

        const updated = await tx.prospect.update({
            where: { id: cardId },
            data
        });

        if (existing.stage !== "Pilot Closed" && updated.stage === "Pilot Closed") {
            await createOnboardingChecklist(updated.id, tx);
        }

        return updated;
    });
};
