import { pool } from "../config/database.js";

const COLUNAS = `id, visitante_id, setor_id, codigo_qr, registrado_em`;

export async function criar({ id, visitanteId, setorId, codigoQr, agora }) {
  /* INSERT IGNORE respeita a UNIQUE (visitante_id, setor_id): uma segunda tentativa
   * de presença no mesmo setor simplesmente não insere nada (affectedRows = 0). */
  const [resultado] = await pool.execute(
    `INSERT IGNORE INTO presencas (id, visitante_id, setor_id, codigo_qr, registrado_em)
     VALUES (?, ?, ?, ?, ?)`,
    [id, visitanteId, setorId, codigoQr, agora],
  );
  return resultado.affectedRows > 0;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.execute(`SELECT ${COLUNAS} FROM presencas WHERE id = ? LIMIT 1`, [
    id,
  ]);
  return linhas[0] ?? null;
}

export async function listarTodas() {
  const [linhas] = await pool.execute(
    `SELECT ${COLUNAS} FROM presencas ORDER BY registrado_em DESC`,
  );
  return linhas;
}
