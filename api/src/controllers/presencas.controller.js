import { asyncHandler } from "../utils/asyncHandler.js";
import * as presencasService from "../services/presencas.service.js";

export const registrar = asyncHandler(async (req, res) => {
  const resultado = await presencasService.registrar(req.body);
  const status = resultado.status === "registrado" ? 201 : 200;
  res.status(status).json({ dados: resultado });
});

export const listar = asyncHandler(async (req, res) => {
  const presencas = await presencasService.listar();
  res.status(200).json({ dados: presencas });
});
