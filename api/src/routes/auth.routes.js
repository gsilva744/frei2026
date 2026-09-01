import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { loginLimiter, authenticatedLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, refreshSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/refresh", loginLimiter, validate(refreshSchema), authController.refresh);
router.post(
  "/logout",
  authenticate,
  authorize("admin", "credenciamento"),
  authenticatedLimiter,
  validate(refreshSchema),
  authController.logout,
);

export default router;
