import type { Request, Response } from "express";
import {
  createEmpleadoSchema,
  horasFiltersSchema,
  registrarHorasSchema,
  updateEmpleadoSchema,
} from "../routes/empleados.schemas";
import { createEmpleado, listEmpleados, updateEmpleado } from "../services/empleadoService";
import { listHorasByEmpleado, registrarHoras } from "../services/horaTrabajadaService";
import { NotFoundError } from "../utils/errors";

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createEmpleadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  const empleado = await createEmpleado(parsed.data);
  res.status(201).json({ empleado });
}

export async function list(_req: Request, res: Response): Promise<void> {
  const empleados = await listEmpleados();
  res.status(200).json({ empleados });
}

export async function update(req: Request, res: Response): Promise<void> {
  const parsed = updateEmpleadoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const empleado = await updateEmpleado(req.params.id as string, parsed.data);
    res.status(200).json({ empleado });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function postHoras(req: Request, res: Response): Promise<void> {
  const parsed = registrarHorasSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const registro = await registrarHoras(req.params.id as string, parsed.data, req.user!.userId);
    res.status(201).json({ registro });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function getHoras(req: Request, res: Response): Promise<void> {
  const parsed = horasFiltersSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Filtros inválidos (mes y anio son requeridos)", details: parsed.error.flatten() });
    return;
  }

  try {
    const resultado = await listHorasByEmpleado(req.params.id as string, parsed.data);
    res.status(200).json(resultado);
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}
