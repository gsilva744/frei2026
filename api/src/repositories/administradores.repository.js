import { pool } from "../config/database.js";

export async function buscarPorEmail(email) {
  const [linhas] = await pool.execute(
    `SELECT id, nome, email, senha_hash, papel, ativo, criado_em, atualizado_em
     FROM administradores WHERE email = ? LIMIT 1`,
    [email],
  );
  return linhas[0] ?? null;
}

export async function buscarPorId(id) {
  const [linhas] = await pool.execute(
    `SELECT id, nome, email, senha_hash, papel, ativo, criado_em, atualizado_em
     FROM administradores WHERE id = ? LIMIT 1`,
    [id],
  );
  return linhas[0] ?? null;
}

export async function criar({ id, nome, email, senhaHash, papel, agora }) {
  await pool.execute(
    `INSERT INTO administradores (id, nome, email, senha_hash, papel, ativo, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, TRUE, ?, ?)`,
    [id, nome, email, senhaHash, papel, agora, agora],
  );
}
