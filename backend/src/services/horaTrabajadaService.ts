import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";

export interface HoraTrabajadaDTO {
  id: string;
  empleadoId: string;
  obraId: string;
  fecha: Date;
  horas: number;
  detalle: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HoraTrabajadaRecord {
  id: string;
  empleadoId: string;
  obraId: string;
  fecha: Date;
  horas: { toString(): string };
  detalle: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDTO(hora: HoraTrabajadaRecord): HoraTrabajadaDTO {
  return { ...hora, horas: Number(hora.horas) };
}

export interface RegistrarHorasInput {
  obraId: string;
  fecha: Date;
  horas: number;
  detalle?: string;
}

export interface HorasFilters {
  mes: number;
  anio: number;
}

export async function registrarHoras(
  empleadoId: string,
  input: RegistrarHorasInput,
  userId: string,
): Promise<HoraTrabajadaDTO> {
  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError("Empleado no encontrado");
  }

  const obra = await prisma.obra.findUnique({ where: { id: input.obraId } });
  if (!obra) {
    throw new NotFoundError("Obra no encontrada");
  }

  const hora = await prisma.horaTrabajada.create({
    data: { ...input, horas: input.horas.toString(), empleadoId, userId },
  });
  return toDTO(hora);
}

export async function listHorasByEmpleado(
  empleadoId: string,
  filters: HorasFilters,
): Promise<{ horasDetalle: HoraTrabajadaDTO[]; totalHoras: number; sueldoEstimado: number }> {
  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError("Empleado no encontrado");
  }

  const desde = new Date(Date.UTC(filters.anio, filters.mes - 1, 1));
  const hasta = new Date(Date.UTC(filters.anio, filters.mes, 1));

  const horas = await prisma.horaTrabajada.findMany({
    where: { empleadoId, fecha: { gte: desde, lt: hasta } },
    orderBy: { fecha: "asc" },
  });

  const horasDetalle = horas.map(toDTO);
  const totalHoras = horasDetalle.reduce((sum, h) => sum + h.horas, 0);
  const sueldoEstimado = totalHoras * Number(empleado.tarifaPorHora);

  return { horasDetalle, totalHoras, sueldoEstimado };
}
