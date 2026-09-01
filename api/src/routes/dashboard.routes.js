import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { authenticatedLimiter } from "../middlewares/rateLimiters.js";

const router = Router();

router.use(authenticate, authorize("admin"), authenticatedLimiter);

router.get("/resumo", dashboardController.resumo);
router.get("/setores", dashboardController.porSetor);
router.get("/rankings", dashboardController.rankings);

export default router;
