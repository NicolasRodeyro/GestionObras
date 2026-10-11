import { z } from "zod";

export const quincenaFiltersSchema = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2000),
});
