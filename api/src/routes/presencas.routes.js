import { Router } from "express";
import * as presencasController from "../controllers/presencas.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { authenticatedLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import { registrarPresencaSchema } from "../schemas/presenca.schema.js";

const router = Router();

router.use(authenticate, authorize("admin", "credenciamento"), authenticatedLimiter);

router.post("/", validate(registrarPresencaSchema), presencasController.registrar);
router.get("/", presencasController.listar);

export default router;
