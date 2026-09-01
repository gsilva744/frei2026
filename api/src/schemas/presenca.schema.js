import { z } from "zod";

export const registrarPresencaSchema = z.object({
  codigoQr: z.string().trim().min(5, "Código QR inválido.").max(120, "Código QR inválido."),
  setorId: z.string().trim().min(1, "Setor não informado.").max(40),
});
