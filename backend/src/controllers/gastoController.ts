import type { Request, Response } from "express";
import { createGastoSchema, gastoFiltersSchema, updateGastoSchema } from "../routes/gastos.schemas";
import {
  createGasto,
  deleteGasto,
  listGastos,
  resumenPorCategoria,
  updateGasto,
} from "../services/gastoService";
import { NotFoundError } from "../utils/errors";

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createGastoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const gasto = await createGasto(parsed.data, req.user!.userId);
    res.status(201).json({ gasto });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  const parsed = gastoFiltersSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Filtros inválidos", details: parsed.error.flatten() });
    return;
  }

  const { gastos, total } = await listGastos(parsed.data);
  res.status(200).json({ gastos, total });
}

export async function resumen(req: Request, res: Response): Promise<void> {
  const parsed = gastoFiltersSchema.omit({ categoria: true }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Filtros inválidos", details: parsed.error.flatten() });
    return;
  }

  const porCategoria = await resumenPorCategoria(parsed.data);
  res.status(200).json({ porCategoria });
}

export async function update(req: Request, res: Response): Promise<void> {
  const parsed = updateGastoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const gasto = await updateGasto(req.params.id as string, parsed.data);
    res.status(200).json({ gasto });
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
    await deleteGasto(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}
