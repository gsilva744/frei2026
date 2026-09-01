import { app } from "./app.js";
import { env } from "./config/env.js";
import { verificarConexao } from "./config/database.js";

async function iniciar() {
  try {
    await verificarConexao();
    console.log("Conexão com o MySQL verificada.");
  } catch (erro) {
    console.error("Não foi possível conectar ao MySQL na inicialização:", erro.message);
    console.error(
      "O servidor vai subir mesmo assim; requisições ao banco falharão até a conexão ser restabelecida.",
    );
  }

  app.listen(env.PORT, () => {
    console.log(`API da Feira Frei 2026 ouvindo em http://localhost:${env.PORT}`);
  });
}

iniciar();
