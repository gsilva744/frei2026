import { erroNaoAutorizado } from "../errors/AppError.js";

/* Deve ser usado sempre depois de authenticate(). Restringe a rota aos papéis
 * informados (ex.: authorize("admin")). */
export function authorize(...papeisPermitidos) {
  return function autorizarPapel(req, res, next) {
    if (!req.usuario || !papeisPermitidos.includes(req.usuario.papel)) {
      next(erroNaoAutorizado());
      return;
    }
    next();
  };
}
