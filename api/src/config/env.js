import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(5050),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ALLOWED_ORIGINS: z
    .string()
    .min(1, "ALLOWED_ORIGINS é obrigatório (lista separada por vírgula).")
    .transform((valor) =>
      valor
        .split(",")
        .map((origem) => origem.trim())
        .filter(Boolean),
    ),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório."),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET deve ter ao menos 16 caracteres."),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET deve ter ao menos 16 caracteres."),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const resultado = schema.safeParse(process.env);

if (!resultado.success) {
  console.error("Configuração inválida. Verifique as variáveis de ambiente:");
  for (const problema of resultado.error.issues) {
    console.error(`  - ${problema.path.join(".")}: ${problema.message}`);
  }
  process.exit(1);
}

export const env = resultado.data;
