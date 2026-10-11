import { Router } from "express";
import { get, pagar } from "../controllers/quincenaController";
import { authenticateToken } from "../middleware/auth";

export const quincenasRouter = Router();

quincenasRouter.use(authenticateToken);

quincenasRouter.get("/:empleadoId", get);
quincenasRouter.put("/:id/pagar", pagar);
