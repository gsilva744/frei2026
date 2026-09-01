import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASTA_MIGRATIONS = path.join(__dirname, "migrations");

async function aplicarMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL não configurado.");
    process.exit(1);
  }

  const conexao = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });

  try {
    await conexao.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        nome VARCHAR(255) PRIMARY KEY,
        aplicada_em DATETIME NOT NULL
      )
    `);

    const [jaAplicadas] = await conexao.query("SELECT nome FROM _migrations");
    const nomesAplicados = new Set(jaAplicadas.map((linha) => linha.nome));

    const arquivos = (await readdir(PASTA_MIGRATIONS))
      .filter((nome) => nome.endsWith(".sql"))
      .sort();

    for (const arquivo of arquivos) {
      if (nomesAplicados.has(arquivo)) {
        console.log(`↷ ${arquivo} já aplicada, pulando.`);
        continue;
      }

      const sql = await readFile(path.join(PASTA_MIGRATIONS, arquivo), "utf-8");
      console.log(`→ Aplicando ${arquivo}...`);
      await conexao.query(sql);
      await conexao.query("INSERT INTO _migrations (nome, aplicada_em) VALUES (?, NOW())", [
        arquivo,
      ]);
      console.log(`✓ ${arquivo} aplicada.`);
    }

    console.log("Migrations em dia.");
  } finally {
    await conexao.end();
  }
}

aplicarMigrations().catch((erro) => {
  console.error("Falha ao aplicar migrations:", erro);
  process.exit(1);
});
