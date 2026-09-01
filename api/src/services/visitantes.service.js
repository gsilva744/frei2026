import { AppError, erroNaoEncontrado } from "../errors/AppError.js";
import * as visitantesRepository from "../repositories/visitantes.repository.js";
import { gerarCodigoUnico, gerarQrCodeSvg, idNovo } from "../utils/qrCode.js";
import { visitanteParaCliente } from "../utils/mappers.js";

function agoraMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export async function criar(dados) {
  const id = idNovo("vis");
  const codigoQr = gerarCodigoUnico();
  const qrCodeSvg = await gerarQrCodeSvg(codigoQr);
  const agora = agoraMysql();

  await visitantesRepository.criar({ ...dados, id, codigoQr, qrCodeSvg, agora });

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
