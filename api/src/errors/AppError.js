/* Erro de domínio: carrega status HTTP, um código estável (para o cliente tratar por
 * código em vez de texto) e uma mensagem exibível ao usuário. */
export class AppError extends Error {
  constructor(statusCode, codigo, mensagem) {
    super(mensagem);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.codigo = codigo;
  }
}

export function erroValidacao(mensagem, codigo = "VALIDACAO") {
  return new AppError(400, codigo, mensagem);
}

export function erroNaoAutenticado(mensagem = "Autenticação necessária.") {
  return new AppError(401, "NAO_AUTENTICADO", mensagem);
}

export function erroNaoAutorizado(mensagem = "Você não tem permissão para esta ação.") {
  return new AppError(403, "NAO_AUTORIZADO", mensagem);
}

export function erroNaoEncontrado(mensagem = "Recurso não encontrado.") {
  return new AppError(404, "NAO_ENCONTRADO", mensagem);
}

export function erroConflito(mensagem, codigo = "CONFLITO") {
  return new AppError(409, codigo, mensagem);
}
