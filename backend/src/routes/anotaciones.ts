import { Router } from "express";
import { remove, update } from "../controllers/anotacionController";
import { authenticateToken } from "../middleware/auth";

export const anotacionesRouter = Router();

anotacionesRouter.use(authenticateToken);

anotacionesRouter.put("/:id", update);
anotacionesRouter.delete("/:id", remove);
