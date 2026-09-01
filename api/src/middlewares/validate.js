import { erroValidacao } from "../errors/AppError.js";

/* Middleware genérico: valida req[origem] (body/query/params) com um schema zod.
 * Em caso de sucesso, substitui req[origem] pelos dados já normalizados/transformados
 * pelo schema (ex.: CPF só com dígitos, e-mail em minúsculas). */
export function validate(schema, origem = "body") {
  return function validarRequisicao(req, res, next) {
    const resultado = schema.safeParse(req[origem]);

    if (!resultado.success) {
      const primeiraMensagem = resultado.error.issues[0]?.message ?? "Dados inválidos.";
      next(erroValidacao(primeiraMensagem));
      return;
    }

    req[origem] = resultado.data;
    next();
  };
}
