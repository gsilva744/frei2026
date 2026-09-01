import * as setoresRepository from "../repositories/setores.repository.js";
import { setorParaCliente } from "../utils/mappers.js";

export async function listar() {
  const linhas = await setoresRepository.listarTodos();
  return linhas.map(setorParaCliente);
}
