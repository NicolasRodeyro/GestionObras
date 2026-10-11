import { z } from "zod";

const categoriaGasto = z.enum(["materiales", "mano_obra", "equipos", "servicios", "otros"]);

export const createGastoSchema = z.object({
  obraId: z.string().uuid(),
  monto: z.number().positive(),
  categoria: categoriaGasto,
  detalle: z.string().optional(),
  fecha: z.coerce.date(),
});

export const updateGastoSchema = createGastoSchema.partial();

export const gastoFiltersSchema = z.object({
  obraId: z.string().uuid().optional(),
  categoria: categoriaGasto.optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});
