import { pool } from "../config/database.js";

const COLUNAS = `
  id, nome, email, cpf, telefone, vinculo, como_soube, genero, curso_interesse,
  participa_como_colaborador, codigo_qr, qr_code_svg, criado_em, atualizado_em
`;

const COLUNA_POR_CAMPO = {
  nome: "nome",
  email: "email",
  cpf: "cpf",
  telefone: "telefone",
  vinculo: "vinculo",
  comoSoube: "como_soube",
  genero: "genero",
  cursoInteresse: "curso_interesse",
  participaComoColaborador: "participa_como_colaborador",
};

export async function criar(dados) {
  await pool.execute(
    `INSERT INTO visitantes (
      id, nome, email, cpf, telefone, vinculo, como_soube, genero, curso_interesse,
      participa_como_colaborador, codigo_qr, qr_code_svg, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dados.id,
      dados.nome,
      dados.email,
      dados.cpf,
      dados.telefone,
      dados.vinculo,
      dados.comoSoube,
      dados.genero,
      dados.cursoInteresse,
      dados.participaComoColaborador,
      dados.codigoQr,
      dados.qrCodeSvg,
      dados.agora,
      dados.agora,
    ],
  );
}

export async function buscarPorId(id) {
  const [linhas] = await pool.execute(`SELECT ${COLUNAS} FROM visitantes WHERE id = ? LIMIT 1`, [
    id,
  ]);
  return linhas[0] ?? null;
}

export async function buscarPorCodigoQr(codigoQr) {
  const [linhas] = await pool.execute(
    `SELECT ${COLUNAS} FROM visitantes WHERE codigo_qr = ? LIMIT 1`,
    [codigoQr],
  );
  return linhas[0] ?? null;
}

export async function listar({ pagina, porPagina, busca }) {
  const offset = (pagina - 1) * porPagina;
  const termo = `%${busca}%`;
  const filtro = busca
    ? `WHERE nome LIKE ? OR email LIKE ? OR cpf LIKE ? OR telefone LIKE ?
       OR curso_interesse LIKE ? OR codigo_qr LIKE ?`
    : "";
  const parametrosFiltro = busca ? [termo, termo, termo, termo, termo, termo] : [];

  const [linhas] = await pool.query(
    `SELECT ${COLUNAS} FROM visitantes ${filtro}
     ORDER BY criado_em DESC LIMIT ? OFFSET ?`,
    [...parametrosFiltro, porPagina, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM visitantes ${filtro}`,
    parametrosFiltro,
  );

  return { linhas, total };
}

export async function listarTodos() {
  const [linhas] = await pool.execute(`SELECT ${COLUNAS} FROM visitantes ORDER BY criado_em DESC`);
  return linhas;
}

export async function atualizar(id, camposParaAtualizar, agora) {
  const campos = Object.keys(camposParaAtualizar);
  if (campos.length === 0) return 0;

  const atribuicoes = campos.map((campo) => `${COLUNA_POR_CAMPO[campo]} = ?`).join(", ");
  const valores = campos.map((campo) => camposParaAtualizar[campo]);

  const [resultado] = await pool.execute(
    `UPDATE visitantes SET ${atribuicoes}, atualizado_em = ? WHERE id = ?`,
    [...valores, agora, id],
  );
  return resultado.affectedRows;
}

export async function remover(id) {
  const [resultado] = await pool.execute(`DELETE FROM visitantes WHERE id = ?`, [id]);
  return resultado.affectedRows;
}
