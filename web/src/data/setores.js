/* Turmas / setores de atração usados no scanner de presença e no dashboard.
 * A lista em si vem da API (GET /setores, ver services/apiFeira.js e
 * VisitantesContext) — esta função só traduz um id para o nome exibível, dada a lista
 * já carregada. */
export function nomeDoSetor(setores, id) {
  return setores.find((setor) => setor.id === id)?.nome || "Setor não informado";
}

/* Opções de gênero e vínculo com o Instituto (usadas no formulário e nos filtros) */
export const generos = ["Masculino", "Feminino", "Outro"];

export const vinculos = ["Aluno atual", "Ex-aluno", "Nunca estudei"];

export const canaisDivulgacao = [
  "Redes sociais",
  "Escola / professor",
  "Indicação de amigo ou familiar",
  "Ex-aluno do Instituto",
  "Cartaz ou panfleto",
  "Outro",
];
