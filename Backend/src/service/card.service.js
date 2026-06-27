import prisma from "../db/prismaClient.js";
import { createOnboardingChecklist } from "../utils/onbord.chicklist.js";
import {
    createNotificationLogs,
    getProspectNotificationRecipients,
} from "./notification.service.js";

export const createCardService = async (payload, actorUser = null) => {
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

        if (actorUser?.id) {
            await createNotificationLogs(tx, [actorUser], {
                type: "prospect_created",
                title: `${created.name} was created`,
                message: `${created.name} was added to the pipeline.`,
                metadata: { prospectId: created.id, actorId: actorUser.id },
            });
        }

        return created;
    });
};

export const updateCardService = async (cardId, payload, actorUser = null) => {
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
            where: { id: cardId },
            include: {
                owner: {
                    select: { id: true, email: true, name: true, role: true }
                }
            }
        });
        if (!existing) throw new Error("Card not found");

        const updated = await tx.prospect.update({
            where: { id: cardId },
            data
        });

        const changedFields = Object.keys(data).filter((field) => {
            const before = existing[field];
            const after = data[field];
            if (field === "lastContactDate" || field === "nextFollowUpDate") {
                const beforeTime = before ? new Date(before).getTime() : null;
                const afterTime = after ? new Date(after).getTime() : null;
                return beforeTime !== afterTime;
            }
            return before !== after;
        });

        if (changedFields.length > 0) {
            const recipients = await getProspectNotificationRecipients(tx, existing, actorUser);
            await createNotificationLogs(tx, recipients, {
                type: "prospect_updated",
                title: `${updated.name} was updated`,
                message: `${updated.name} changed: ${changedFields.join(", ")}.`,
                metadata: {
                    prospectId: updated.id,
                    actorId: actorUser?.id || null,
                    changedFields,
                },
            });
        }

        if (existing.stage !== "Pilot Closed" && updated.stage === "Pilot Closed") {
            await createOnboardingChecklist(updated.id, tx);
        }

        return updated;
    });
};
