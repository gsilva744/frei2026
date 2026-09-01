import { Router } from "express";
import * as setoresController from "../controllers/setores.controller.js";
import { publicReadLimiter } from "../middlewares/rateLimiters.js";

const router = Router();

router.get("/", publicReadLimiter, setoresController.listar);

export default router;
