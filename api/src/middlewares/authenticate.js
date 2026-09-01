import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { erroNaoAutenticado } from "../errors/AppError.js";

/* Extrai e valida o access token (Authorization: Bearer <token>).
 * Em caso de sucesso, popula req.usuario = { id, papel }. */
export function authenticate(req, res, next) {
  const cabecalho = req.headers.authorization ?? "";

  if (!cabecalho.startsWith("Bearer ")) {
    next(erroNaoAutenticado());
    return;
  }

  const token = cabecalho.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.usuario = { id: payload.sub, papel: payload.papel };
    next();
  } catch {
    next(erroNaoAutenticado("Sessão expirada ou inválida. Faça login novamente."));
  }
}
