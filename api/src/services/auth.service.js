import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import * as administradoresRepository from "../repositories/administradores.repository.js";
import * as refreshTokensRepository from "../repositories/refreshTokens.repository.js";
import { administradorParaCliente } from "../utils/mappers.js";

const CUSTO_HASH = 12;

function credenciaisInvalidas() {
  return new AppError(401, "CREDENCIAIS_INVALIDAS", "E-mail ou senha inválidos.");
}

function refreshInvalido() {
  return new AppError(401, "REFRESH_INVALIDO", "Sessão expirada. Faça login novamente.");
}

function msParaExpiracao(expressao) {
  const combinacao = /^(\d+)([smhd])$/.exec(expressao);
  if (!combinacao) return 15 * 60 * 1000;
  const valor = Number(combinacao[1]);
  const unidade = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[
    combinacao[2]
  ];
  return valor * unidade;
}

async function emitirTokens(administrador) {
  const accessToken = jwt.sign(
    { sub: administrador.id, papel: administrador.papel },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  );

  const refreshId = randomUUID();
  const refreshToken = jwt.sign({ sub: administrador.id, jti: refreshId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  const tokenHash = await bcrypt.hash(refreshToken, CUSTO_HASH);
  const agora = new Date();
  const expiraEm = new Date(agora.getTime() + msParaExpiracao(env.JWT_REFRESH_EXPIRES_IN));

  await refreshTokensRepository.criar({
    id: refreshId,
    administradorId: administrador.id,
    tokenHash,
    expiraEm: formatarDataMysql(expiraEm),
    agora: formatarDataMysql(agora),
  });

  return {
    accessToken,
    refreshToken,
    administrador: administradorParaCliente(administrador),
  };
}

function formatarDataMysql(data) {
  return data.toISOString().slice(0, 19).replace("T", " ");
}

export async function login({ email, senha }) {
  const administrador = await administradoresRepository.buscarPorEmail(email);
  if (!administrador || !administrador.ativo) throw credenciaisInvalidas();

  const senhaConfere = await bcrypt.compare(senha, administrador.senha_hash);
  if (!senhaConfere) throw credenciaisInvalidas();

  return emitirTokens(administrador);
}

export async function renovar(refreshTokenRecebido) {
  let payload;
  try {
    payload = jwt.verify(refreshTokenRecebido, env.JWT_REFRESH_SECRET);
  } catch {
    throw refreshInvalido();
  }

  const registro = await refreshTokensRepository.buscarPorId(payload.jti);
  if (!registro || registro.revogado_em || new Date(registro.expira_em) < new Date()) {
    throw refreshInvalido();
  }

  const tokenConfere = await bcrypt.compare(refreshTokenRecebido, registro.token_hash);
  if (!tokenConfere) throw refreshInvalido();

  // Rotação: o token usado nunca pode ser reaproveitado, mesmo que ainda não tenha expirado.
  await refreshTokensRepository.revogar(registro.id);

  const administrador = await administradoresRepository.buscarPorId(payload.sub);
  if (!administrador || !administrador.ativo) throw refreshInvalido();

  return emitirTokens(administrador);
}

export async function logout(refreshTokenRecebido) {
  try {
    const payload = jwt.verify(refreshTokenRecebido, env.JWT_REFRESH_SECRET);
    await refreshTokensRepository.revogar(payload.jti);
  } catch {
    // Token já inválido/expirado: não há sessão para revogar, mas o logout ainda "funciona"
    // do ponto de vista do cliente (ele descarta os tokens de qualquer forma).
  }
}
