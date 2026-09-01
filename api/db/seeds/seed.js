import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import "dotenv/config";

/* Cria o primeiro administrador (papel "admin") a partir das variáveis
 * ADMIN_SEED_NOME / ADMIN_SEED_EMAIL / ADMIN_SEED_SENHA. Idempotente: não faz nada
 * se já existir um administrador com o mesmo e-mail. */
async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  const nome = process.env.ADMIN_SEED_NOME;
  const email = process.env.ADMIN_SEED_EMAIL;
  const senha = process.env.ADMIN_SEED_SENHA;

  if (!databaseUrl || !nome || !email || !senha) {
    console.error(
      "Defina DATABASE_URL, ADMIN_SEED_NOME, ADMIN_SEED_EMAIL e ADMIN_SEED_SENHA antes de rodar o seed.",
    );
    process.exit(1);
  }

  const conexao = await mysql.createConnection({ uri: databaseUrl });

  try {
    const [existentes] = await conexao.execute("SELECT id FROM administradores WHERE email = ?", [
      email,
    ]);
    if (existentes.length > 0) {
      console.log(`Administrador ${email} já existe, nada a fazer.`);
      return;
    }

    const id = randomUUID();
    const senhaHash = await bcrypt.hash(senha, 12);
    const agora = new Date().toISOString().slice(0, 19).replace("T", " ");

    await conexao.execute(
      `INSERT INTO administradores (id, nome, email, senha_hash, papel, ativo, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, 'admin', TRUE, ?, ?)`,
      [id, nome, email, senhaHash, agora, agora],
    );

    console.log(`Administrador ${email} criado com sucesso (papel: admin).`);
  } finally {
    await conexao.end();
  }
}

seed().catch((erro) => {
  console.error("Falha ao rodar o seed:", erro);
  process.exit(1);
});
