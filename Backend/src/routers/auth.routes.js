import express from "express";
import AuthController from "../controllers/auth.controller.js";
import { requireAuth, authorizeRoles } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { loginBodySchema, registerBodySchema } from "../validation/auth.validation.js";
import { ADMIN_ROLES } from "../utils/roles.js";

const router = express.Router();
const controller = new AuthController();

// Public auth routes
router.post("/register", validateRequest({ body: registerBodySchema }), (req, res) => controller.register(req, res));
router.post("/login", validateRequest({ body: loginBodySchema }), (req, res) => controller.login(req, res));

// Authenticated routes
router.get("/me", requireAuth, (req, res) => controller.me(req, res));
router.post("/logout", requireAuth, (req, res) => controller.logout(req, res));

// Admin-only user management
router.get("/users", requireAuth, authorizeRoles(...ADMIN_ROLES), (req, res) => controller.listUsers(req, res));
router.patch("/users/:id/role", requireAuth, authorizeRoles(...ADMIN_ROLES), (req, res) => controller.updateUserRole(req, res));

export default router;

