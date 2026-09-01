import { asyncHandler } from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboard.service.js";

export const resumo = asyncHandler(async (req, res) => {
  const dados = await dashboardService.resumo();
  res.status(200).json({ dados });
});

export const porSetor = asyncHandler(async (req, res) => {
  const dados = await dashboardService.porSetor();
  res.status(200).json({ dados });
});

export const rankings = asyncHandler(async (req, res) => {
  const dados = await dashboardService.rankings();
  res.status(200).json({ dados });
});
