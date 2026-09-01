import mysql from "mysql2/promise";
import { env } from "./env.js";

/* Pool único e reutilizado por toda a aplicação. mysql2 já faz prepared statements
 * com `?` — nunca concatenar valor de usuário nas strings SQL. */
export const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

export async function verificarConexao() {
  const conexao = await pool.getConnection();
  try {
    await conexao.ping();
  } finally {
    conexao.release();
  }
}
