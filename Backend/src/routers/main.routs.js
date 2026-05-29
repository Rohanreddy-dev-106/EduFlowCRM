import express from "express";
import MainControllers from "../controllers/main.controller.js";
import AnalyticsController from "../controllers/analytics.controller.js";
import { authorizeRoles, requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
	addNoteBodySchema,
	cardIdParamSchema,
	createCardBodySchema,
	idParamSchema,
	paginationQuerySchema,
	updateCardBodySchema,
	updateChecklistBodySchema
} from "../validation/main.validation.js";
import {
	ANALYTICS_ROLES,
	PROSPECT_EDIT_ROLES,
	PROSPECT_VIEW_ROLES
} from "../utils/roles.js";

const router = express.Router();
const controller = new MainControllers();
const analyticsController = new AnalyticsController();

router.use(requireAuth);

// ─── Analytics ──────────────────────────────────────────────────
router.get("/analytics", authorizeRoles(...ANALYTICS_ROLES), (req, res, next) => analyticsController.getAnalytics(req, res, next));

// ─── Cards ───────────────────────────────────────────────────────
router.get("/cards", authorizeRoles(...PROSPECT_VIEW_ROLES), validateRequest({ query: paginationQuerySchema }), (req, res, next) => controller.getAllCards(req, res, next));
router.get("/cards/:id", authorizeRoles(...PROSPECT_VIEW_ROLES), validateRequest({ params: idParamSchema }), (req, res, next) => controller.getCardById(req, res, next));
router.post("/cards", authorizeRoles(...PROSPECT_EDIT_ROLES), validateRequest({ body: createCardBodySchema }), (req, res, next) => controller.createCard(req, res, next));
router.patch("/cards/:id", authorizeRoles(...PROSPECT_EDIT_ROLES), validateRequest({ params: idParamSchema, body: updateCardBodySchema }), (req, res, next) => controller.updateCard(req, res, next));
router.delete("/cards/:id", authorizeRoles(...PROSPECT_EDIT_ROLES), validateRequest({ params: idParamSchema }), (req, res, next) => controller.deleteCard(req, res, next));

// ─── Notes ───────────────────────────────────────────────────────
router.post("/cards/:cardId/notes", authorizeRoles(...PROSPECT_VIEW_ROLES), validateRequest({ params: cardIdParamSchema, body: addNoteBodySchema }), (req, res, next) => controller.addNote(req, res, next));
router.get("/cards/:cardId/notes", authorizeRoles(...PROSPECT_VIEW_ROLES), validateRequest({ params: cardIdParamSchema, query: paginationQuerySchema }), (req, res, next) => controller.getNotesByCard(req, res, next));

// ─── Checklist ───────────────────────────────────────────────────
router.get("/cards/:cardId/checklist", authorizeRoles(...PROSPECT_VIEW_ROLES), validateRequest({ params: cardIdParamSchema, query: paginationQuerySchema }), (req, res, next) => controller.getChecklistByCard(req, res, next));
router.patch("/checklist/:id", authorizeRoles(...PROSPECT_EDIT_ROLES), validateRequest({ params: idParamSchema, body: updateChecklistBodySchema }), (req, res, next) => controller.updateChecklistStatus(req, res, next));

export default router;