import { asyncHandler } from "../utils/asyncHandler.js";
import * as setoresService from "../services/setores.service.js";

export const listar = asyncHandler(async (req, res) => {
  const setores = await setoresService.listar();
  res.status(200).json({ dados: setores });
});
