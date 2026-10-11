import { z } from "zod";

const estadoEmpleado = z.enum(["activo", "inactivo"]);

export const createEmpleadoSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email().optional(),
  dni: z.string().min(1).optional(),
  tarifaPorHora: z.number().positive(),
  estado: estadoEmpleado.optional(),
});

export const updateEmpleadoSchema = createEmpleadoSchema.partial();

export const registrarHorasSchema = z.object({
  obraId: z.string().uuid(),
  fecha: z.coerce.date(),
  horas: z.number().min(0),
  detalle: z.string().optional(),
});

export const horasFiltersSchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2000),
});
