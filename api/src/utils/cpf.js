/* Validação de dígito verificador de CPF (portada de web/src/server/apiFeira.ts).
 * Não aceita 11 dígitos repetidos (ex.: 111.111.111-11). */
export function cpfValido(cpf) {
  if (typeof cpf !== "string" || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;

  return resto === Number(cpf[10]);
}

export function somenteDigitos(valor) {
  return typeof valor === "string" ? valor.replace(/\D/g, "") : "";
}
