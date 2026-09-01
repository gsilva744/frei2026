import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  res.status(200).json({ dados: resultado });
});

export const refresh = asyncHandler(async (req, res) => {
  const resultado = await authService.renovar(req.body.refreshToken);
  res.status(200).json({ dados: resultado });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});
