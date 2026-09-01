import { pool } from "../config/database.js";

export async function criar({ id, administradorId, tokenHash, expiraEm, agora }) {
  await pool.execute(
    `INSERT INTO refresh_tokens (id, administrador_id, token_hash, expira_em, revogado_em, criado_em)
     VALUES (?, ?, ?, ?, NULL, ?)`,
    [id, administradorId, tokenHash, expiraEm, agora],
  );
}

export async function buscarPorId(id) {
  const [linhas] = await pool.execute(
    `SELECT id, administrador_id, token_hash, expira_em, revogado_em, criado_em
     FROM refresh_tokens WHERE id = ? LIMIT 1`,
    [id],
  );
  return linhas[0] ?? null;
}

export async function revogar(id) {
  await pool.execute(
    `UPDATE refresh_tokens SET revogado_em = NOW() WHERE id = ? AND revogado_em IS NULL`,
    [id],
  );
}
