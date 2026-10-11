import { Router } from "express";
import { create, getHoras, list, postHoras, update } from "../controllers/empleadoController";
import { authenticateToken } from "../middleware/auth";

export const empleadosRouter = Router();

empleadosRouter.use(authenticateToken);

empleadosRouter.get("/", list);
empleadosRouter.post("/", create);
empleadosRouter.put("/:id", update);
empleadosRouter.get("/:id/horas", getHoras);
empleadosRouter.post("/:id/horas", postHoras);
