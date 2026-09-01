import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(1, "Informe a senha."),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token inválido."),
});
