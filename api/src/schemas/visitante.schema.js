import { z } from "zod";
import { cpfValido, somenteDigitos } from "../utils/cpf.js";

const texto = (mensagemObrigatorio) =>
  z.string({
    required_error: mensagemObrigatorio,
    invalid_type_error: mensagemObrigatorio,
  });

const nome = texto("Informe o nome completo.")
  .trim()
  .min(3, "Informe o nome completo (3 a 100 caracteres).")
  .max(100);
const email = texto("Informe o e-mail.")
  .trim()
  .toLowerCase()
  .min(1, "Informe o e-mail.")
  .email("E-mail inválido.")
  .max(255);
const cpf = texto("Informe o CPF.")
  .transform((valor) => somenteDigitos(valor))
  .refine((valor) => cpfValido(valor), "CPF inválido.");
const telefone = texto("Informe o telefone.")
  .transform((valor) => somenteDigitos(valor))
  .refine((valor) => valor.length >= 10 && valor.length <= 11, "Informe um telefone com DDD.");
const vinculo = z.enum(["Aluno atual", "Ex-aluno", "Nunca estudei"], {
  errorMap: () => ({ message: "Vínculo inválido." }),
});
const genero = z.enum(["Masculino", "Feminino", "Outro"], {
  errorMap: () => ({ message: "Gênero inválido." }),
});
const comoSoube = texto("Informe como ficou sabendo da feira.")
  .trim()
  .min(1, "Informe como ficou sabendo da feira.")
  .max(100);
const cursoInteresse = texto("Informe o curso de interesse.")
  .trim()
  .min(1, "Informe o curso de interesse.")
  .max(150);
const participaComoColaborador = z.coerce.boolean().default(false);

export const criarVisitanteSchema = z.object({
  nome,
  email,
  cpf,
  telefone,
  vinculo,
  comoSoube,
  genero,
  cursoInteresse,
  participaComoColaborador,
});

export const atualizarVisitanteSchema = z
  .object({
    nome: nome.optional(),
    email: email.optional(),
    cpf: cpf.optional(),
    telefone: telefone.optional(),
    vinculo: vinculo.optional(),
    comoSoube: comoSoube.optional(),
    genero: genero.optional(),
    cursoInteresse: cursoInteresse.optional(),
    participaComoColaborador: participaComoColaborador.optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Nenhum campo válido para atualizar.",
  });

export const listarVisitantesQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(200).default(20),
  busca: z.string().trim().max(150).optional().default(""),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1, "Identificador inválido."),
});

/* O código vem de fora do sistema (impressão física, outro sistema) — não é o app que
 * gera nem valida formato além de não estar vazio e caber na coluna. */
export const checkinSchema = z.object({
  codigoQr: texto("Informe o código do QR Code.")
    .trim()
    .min(1, "Informe o código do QR Code.")
    .max(120),
});
