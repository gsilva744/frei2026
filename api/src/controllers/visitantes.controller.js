import { asyncHandler } from "../utils/asyncHandler.js";
import * as visitantesService from "../services/visitantes.service.js";

export const criar = asyncHandler(async (req, res) => {
  const visitante = await visitantesService.criar(req.body);
  res.status(201).json({ dados: visitante });
});

export const listar = asyncHandler(async (req, res) => {
  const { dados, paginacao } = await visitantesService.listar(req.query);
  res.status(200).json({ dados, paginacao });
});

export const buscar = asyncHandler(async (req, res) => {
  const visitante = await visitantesService.buscarPorId(req.params.id);
  res.status(200).json({ dados: visitante });
});

export const atualizar = asyncHandler(async (req, res) => {
  const visitante = await visitantesService.atualizar(req.params.id, req.body);
  res.status(200).json({ dados: visitante });
});

export const remover = asyncHandler(async (req, res) => {
  await visitantesService.remover(req.params.id);
  res.status(204).send();
});

export const checkin = asyncHandler(async (req, res) => {
  const visitante = await visitantesService.checkin(req.params.id, req.body.codigoQr);
  res.status(200).json({ dados: visitante });
});
