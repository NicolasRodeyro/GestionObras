import type { Request, Response } from "express";
import { createObraSchema, updateObraSchema } from "../routes/obras.schemas";
import { createObra, deleteObra, getObraById, listObras, updateObra } from "../services/obraService";
import { NotFoundError } from "../utils/errors";

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createObraSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  const obra = await createObra(parsed.data, req.user!.userId);
  res.status(201).json({ obra });
}

export async function list(_req: Request, res: Response): Promise<void> {
  const obras = await listObras();
  res.status(200).json({ obras });
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const obra = await getObraById(req.params.id as string);
    res.status(200).json({ obra });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const parsed = updateObraSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const obra = await updateObra(req.params.id as string, parsed.data);
    res.status(200).json({ obra });
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
    await deleteObra(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}
