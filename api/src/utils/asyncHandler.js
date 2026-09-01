/* Evita try/catch repetido nos controllers: encaminha qualquer rejeição da rota
 * assíncrona para o errorHandler central via next(). */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
