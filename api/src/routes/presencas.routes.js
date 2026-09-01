import { Router } from "express";
import * as presencasController from "../controllers/presencas.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { authenticatedLimiter } from "../middlewares/rateLimiters.js";
import { validate } from "../middlewares/validate.js";
import { registrarPresencaSchema } from "../schemas/presenca.schema.js";

const router = Router();

router.use(authenticate, authenticatedLimiter);

// Registrar presença é a função do leitor de QR — não precisa acessar a lista de
// visitantes (`credenciamento` não tem essa rota liberada aqui).
router.post(
  "/",
  authorize("admin", "leitor"),
  validate(registrarPresencaSchema),
  presencasController.registrar,
);

// Ler a lista de presenças alimenta os contadores do hub/credenciamento/leitor.
router.get("/", authorize("admin", "credenciamento", "leitor"), presencasController.listar);

export default router;
