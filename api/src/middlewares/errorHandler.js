import { AppError, erroNaoEncontrado } from "../errors/AppError.js";

export function notFoundHandler(req, res, next) {
  next(erroNaoEncontrado("Rota da API não encontrada."));
}

/* Handler central de erros. Erros de negócio (AppError) viram a resposta esperada
 * pelo cliente; qualquer outra exceção (bug, driver MySQL, etc.) é logada por completo
 * no servidor e devolvida ao cliente apenas como erro genérico — nunca stack trace ou
 * SQL. Precisa dos 4 parâmetros para o Express reconhecer como error handler. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ erro: { codigo: err.codigo, mensagem: err.message } });
    return;
  }

  const codigoBanco = err?.code;

  if (codigoBanco === "ER_DUP_ENTRY") {
    res.status(409).json({
      erro: { codigo: "REGISTRO_DUPLICADO", mensagem: "CPF ou código QR já cadastrado." },
    });
    return;
  }

  req.log?.error({ err }, "Erro não tratado");
  res
    .status(500)
    .json({ erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno. Tente novamente." } });
}
