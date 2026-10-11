import { Router } from "express";
import { create, getById, list, remove, update } from "../controllers/obraController";
import { create as createAnotacion, list as listAnotaciones } from "../controllers/anotacionController";
import { authenticateToken } from "../middleware/auth";

export const obrasRouter = Router();

obrasRouter.use(authenticateToken);

obrasRouter.get("/", list);
obrasRouter.get("/:id", getById);
obrasRouter.post("/", create);
obrasRouter.put("/:id", update);
obrasRouter.delete("/:id", remove);
obrasRouter.get("/:id/anotaciones", listAnotaciones);
obrasRouter.post("/:id/anotaciones", createAnotacion);
