import { Router } from "express";
import { create, list, remove, resumen, update } from "../controllers/gastoController";
import { authenticateToken } from "../middleware/auth";

export const gastosRouter = Router();

gastosRouter.use(authenticateToken);

gastosRouter.get("/resumen", resumen);
gastosRouter.get("/", list);
gastosRouter.post("/", create);
gastosRouter.put("/:id", update);
gastosRouter.delete("/:id", remove);
