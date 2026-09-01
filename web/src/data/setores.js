/* Turmas / setores de atração usados no scanner de presença e no dashboard */
export const setores = [
  { id: "informatica", nome: "Informática", andar: "1º Andar", cor: "#17356f" },
  { id: "comunicacao", nome: "Comunicação Visual", andar: "3º Andar", cor: "#2a4d94" },
  { id: "ingles", nome: "Inglês", andar: "2º Andar", cor: "#0f2550" },
  { id: "administracao", nome: "Administração", andar: "2º Andar", cor: "#f5c435" },
  { id: "mecanica", nome: "Mecânica", andar: "Pátio", cor: "#e0ad19" },
];

export function nomeDoSetor(id) {
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
