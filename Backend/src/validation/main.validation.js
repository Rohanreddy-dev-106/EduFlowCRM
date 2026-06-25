import { z } from "zod";

const stageSchema = z.enum([
    "Cold",
    "Contacted",
    "Demo Booked",
    "Demo Done",
    "Proposal Sent",
    "Pilot Closed"
]);

const optionalTextSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
        if (value === undefined) return undefined;
        if (value === null) return null;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    });

const optionalEmailSchema = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
        if (value === undefined) return undefined;
        if (value === null) return null;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    })
    .refine((email) => email === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Invalid email");

export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
});

export const idParamSchema = z.object({
    id: z.string().min(1, "Invalid id format")
});

export const cardIdParamSchema = z.object({
    cardId: z.string().min(1, "Invalid id format")
});

export const createCardBodySchema = z.object({
    name: z.string().trim().min(1, "name is required"),
    school: z.string().trim().min(1, "school is required"),
    role: optionalTextSchema.optional(),
    email: optionalEmailSchema.optional(),
    phone: optionalTextSchema.optional(),
    source: optionalTextSchema.optional(),
    stage: stageSchema.optional(),
    lastContactDate: z.union([z.string().trim(), z.null()]).optional(),
    nextFollowUpDate: z.union([z.string().trim(), z.null()]).optional()
});

export const updateCardBodySchema =
    createCardBodySchema.partial().refine(
        (payload) => Object.keys(payload).length > 0,
        "At least one field is required to update"
    );

export const addNoteBodySchema = z.object({
    content: z.string().trim().min(1, "content is required").max(2000)
});

export const updateChecklistBodySchema = z.object({
    status: z.enum(["todo", "done"])
});
