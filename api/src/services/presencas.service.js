import { erroValidacao } from "../errors/AppError.js";
import * as presencasRepository from "../repositories/presencas.repository.js";
import * as setoresRepository from "../repositories/setores.repository.js";
import * as visitantesRepository from "../repositories/visitantes.repository.js";
import { idNovo } from "../utils/qrCode.js";
import { presencaParaCliente, visitanteParaCliente } from "../utils/mappers.js";

function agoraMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/* Espelha o contrato de status já usado pelo leitor de QR do front-end
 * (web/src/components/LeitorQr/LeitorQr.jsx): "registrado" | "repetido" | "desconhecido". */
export async function registrar({ codigoQr, setorId }) {
  const setorValido = await setoresRepository.existe(setorId);
  if (!setorValido) throw erroValidacao("Setor não encontrado.", "SETOR_INVALIDO");

  const visitante = await visitantesRepository.buscarPorCodigoQr(codigoQr);
  if (!visitante) {
    return { status: "desconhecido", visitante: null, presenca: null };
  }

  const id = idNovo("pre");
  const agora = agoraMysql();
  const inserida = await presencasRepository.criar({
    id,
    visitanteId: visitante.id,
    setorId,
    codigoQr,
    agora,
  });

  if (!inserida) {
    return { status: "repetido", visitante: visitanteParaCliente(visitante), presenca: null };
  }

  const presenca = await presencasRepository.buscarPorId(id);
  return {
    status: "registrado",
    visitante: visitanteParaCliente(visitante),
    presenca: presenca ? presencaParaCliente(presenca) : null,
  };
}

export async function listar() {
  const linhas = await presencasRepository.listarTodas();
  return linhas.map(presencaParaCliente);
}
