import type { Request, Response } from "express";
import { createAnotacionSchema, updateAnotacionSchema } from "../routes/anotaciones.schemas";
import {
  createAnotacion,
  deleteAnotacion,
  listAnotacionesByObra,
  updateAnotacion,
} from "../services/anotacionService";
import { NotFoundError } from "../utils/errors";

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createAnotacionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const anotacion = await createAnotacion(req.params.id as string, parsed.data, req.user!.userId);
    res.status(201).json({ anotacion });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const anotaciones = await listAnotacionesByObra(req.params.id as string);
    res.status(200).json({ anotaciones });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const parsed = updateAnotacionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const anotacion = await updateAnotacion(req.params.id as string, parsed.data);
    res.status(200).json({ anotacion });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await deleteAnotacion(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}
