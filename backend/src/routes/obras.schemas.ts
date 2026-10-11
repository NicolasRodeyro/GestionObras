import { z } from "zod";

const estadoObra = z.enum(["planificada", "en_progreso", "pausada", "finalizada"]);

export const createObraSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
  estado: estadoObra.optional(),
  presupuesto: z.number().positive(),
});

export const updateObraSchema = createObraSchema.partial();
