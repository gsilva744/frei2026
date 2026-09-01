import { Router } from "express";
import * as visitantesController from "../controllers/visitantes.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { authenticatedLimiter, publicWriteLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import {
  atualizarVisitanteSchema,
  checkinSchema,
  criarVisitanteSchema,
  idParamSchema,
  listarVisitantesQuerySchema,
} from "../schemas/visitante.schema.js";

const router = Router();

// Inscrição pública (hotsite) ou credenciamento no local — sem autenticação.
router.post("/", publicWriteLimiter, validate(criarVisitanteSchema), visitantesController.criar);

router.use(authenticate);

router.get(
  "/",
  authorize("admin", "credenciamento"),
  authenticatedLimiter,
  validate(listarVisitantesQuerySchema, "query"),
  visitantesController.listar,
);

router.get(
  "/:id",
  authorize("admin", "credenciamento"),
  authenticatedLimiter,
  validate(idParamSchema, "params"),
  visitantesController.buscar,
);

router.patch(
  "/:id",
  authorize("admin", "credenciamento"),
  authenticatedLimiter,
  validate(idParamSchema, "params"),
  validate(atualizarVisitanteSchema),
  visitantesController.atualizar,
);

router.delete(
  "/:id",
  authorize("admin"),
  authenticatedLimiter,
  validate(idParamSchema, "params"),
  visitantesController.remover,
);

router.patch(
  "/:id/checkin",
  authorize("admin", "credenciamento"),
  authenticatedLimiter,
  validate(idParamSchema, "params"),
  validate(checkinSchema),
  visitantesController.checkin,
);

export default router;
