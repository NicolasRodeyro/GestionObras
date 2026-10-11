import type { Request, Response } from "express";
import { quincenaFiltersSchema } from "../routes/quincenas.schemas";
import { calcularQuincena, marcarComoPagada } from "../services/quincenaService";
import { NotFoundError } from "../utils/errors";

export async function get(req: Request, res: Response): Promise<void> {
  const parsed = quincenaFiltersSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Filtros inválidos (mes y anio son requeridos)", details: parsed.error.flatten() });
    return;
  }

  try {
    const quincena = await calcularQuincena(req.params.empleadoId as string, parsed.data.mes, parsed.data.anio);
    res.status(200).json({ quincena });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function pagar(req: Request, res: Response): Promise<void> {
  try {
    const quincena = await marcarComoPagada(req.params.id as string);
    res.status(200).json({ quincena });
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    throw err;
  }
}
