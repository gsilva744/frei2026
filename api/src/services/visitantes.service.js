import { AppError, erroNaoEncontrado } from "../errors/AppError.js";
import * as visitantesRepository from "../repositories/visitantes.repository.js";
import { idNovo } from "../utils/qrCode.js";
import { visitanteParaCliente } from "../utils/mappers.js";

function agoraMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/* O código QR não é gerado por este sistema: ele vem de outra impressão/sistema e só é
 * vinculado ao visitante no check-in feito pela equipe de credenciamento (ver checkin()
 * abaixo). Por isso o cadastro sempre entra com codigoQr/qrCodeSvg vazios. */
export async function criar(dados) {
  const id = idNovo("vis");
  const agora = agoraMysql();

  await visitantesRepository.criar({ ...dados, id, codigoQr: null, qrCodeSvg: null, agora });

  const salvo = await visitantesRepository.buscarPorId(id);
  if (!salvo) {
    throw new AppError(
      500,
      "ERRO_INTERNO",
      "Visitante cadastrado, mas não foi possível recuperar os dados.",
    );
  }

  return visitanteParaCliente(salvo);
}

export async function buscarPorId(id) {
  const linha = await visitantesRepository.buscarPorId(id);
  if (!linha) throw erroNaoEncontrado("Visitante não encontrado.");
  return visitanteParaCliente(linha);
}

export async function listar({ pagina, porPagina, busca }) {
  const { linhas, total } = await visitantesRepository.listar({ pagina, porPagina, busca });
  return {
    dados: linhas.map(visitanteParaCliente),
    paginacao: { pagina, porPagina, total },
  };
}

export async function atualizar(id, camposParaAtualizar) {
  const linhasAfetadas = await visitantesRepository.atualizar(
    id,
    camposParaAtualizar,
    agoraMysql(),
  );
  if (!linhasAfetadas) throw erroNaoEncontrado("Visitante não encontrado.");

  const salvo = await visitantesRepository.buscarPorId(id);
  return visitanteParaCliente(salvo);
}

export async function remover(id) {
  const linhasAfetadas = await visitantesRepository.remover(id);
  if (!linhasAfetadas) throw erroNaoEncontrado("Visitante não encontrado.");
}

/* Vincula o código QR (informado manualmente pela equipe) ao visitante e registra o
 * horário de chegada. Não valida correspondência com nada além do próprio banco. */
export async function checkin(id, codigoQr) {
  const agora = agoraMysql();
  const linhasAfetadas = await visitantesRepository.registrarCheckin(id, codigoQr, agora);
  if (!linhasAfetadas) throw erroNaoEncontrado("Visitante não encontrado.");

  const salvo = await visitantesRepository.buscarPorId(id);
  return visitanteParaCliente(salvo);
}
