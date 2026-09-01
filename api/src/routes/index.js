import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import presencasRoutes from "./presencas.routes.js";
import setoresRoutes from "./setores.routes.js";
import visitantesRoutes from "./visitantes.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/setores", setoresRoutes);
router.use("/visitantes", visitantesRoutes);
router.use("/presencas", presencasRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
