import { z } from "zod";

const prioridad = z.enum(["baja", "media", "alta"]);

export const createAnotacionSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional(),
  prioridad: prioridad.optional(),
});

export const updateAnotacionSchema = z.object({
  titulo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  prioridad: prioridad.optional(),
  completada: z.boolean().optional(),
});
