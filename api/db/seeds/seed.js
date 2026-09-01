import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import "dotenv/config";

/* Cria um administrador por papel (admin, credenciamento, leitor), a partir das
 * variáveis <PAPEL>_SEED_NOME / <PAPEL>_SEED_EMAIL / <PAPEL>_SEED_SENHA. Idempotente:
 * não faz nada para um e-mail que já existe. Cada papel só precisa ser configurado se
 * for usado — variáveis ausentes pulam aquele papel sem erro. */
const PAPEIS = [
  { papel: "admin", prefixo: "ADMIN_SEED" },
  { papel: "credenciamento", prefixo: "CREDENCIAMENTO_SEED" },
  { papel: "leitor", prefixo: "LEITOR_SEED" },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Defina DATABASE_URL antes de rodar o seed.");
    process.exit(1);
  }

  const conexao = await mysql.createConnection({ uri: databaseUrl });

  try {
    let algumConfigurado = false;

    for (const { papel, prefixo } of PAPEIS) {
      const nome = process.env[`${prefixo}_NOME`];
      const email = process.env[`${prefixo}_EMAIL`];
      const senha = process.env[`${prefixo}_SENHA`];

      if (!nome || !email || !senha) {
        console.log(`↷ ${prefixo}_* não configurado, pulando papel "${papel}".`);
        continue;
      }
      algumConfigurado = true;

      const [existentes] = await conexao.execute("SELECT id FROM administradores WHERE email = ?", [
        email,
      ]);
      if (existentes.length > 0) {
        console.log(`Administrador ${email} (${papel}) já existe, nada a fazer.`);
        continue;
      }

      const id = randomUUID();
      const senhaHash = await bcrypt.hash(senha, 12);
      const agora = new Date().toISOString().slice(0, 19).replace("T", " ");

      await conexao.execute(
        `INSERT INTO administradores (id, nome, email, senha_hash, papel, ativo, criado_em, atualizado_em)
         VALUES (?, ?, ?, ?, ?, TRUE, ?, ?)`,
        [id, nome, email, senhaHash, papel, agora, agora],
      );

      console.log(`Administrador ${email} criado com sucesso (papel: ${papel}).`);
    }

    if (!algumConfigurado) {
      console.error(
        "Nenhuma variável de seed configurada. Defina ao menos um conjunto " +
          "<PAPEL>_SEED_NOME/_EMAIL/_SENHA (ADMIN_SEED_*, CREDENCIAMENTO_SEED_* ou LEITOR_SEED_*).",
      );
      process.exit(1);
    }
  } finally {
    await conexao.end();
  }
}

seed().catch((erro) => {
  console.error("Falha ao rodar o seed:", erro);
  process.exit(1);
});
