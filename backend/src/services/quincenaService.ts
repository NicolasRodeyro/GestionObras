import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import type { EstadoQuincena } from "../generated/prisma/client";

export interface QuincenaDTO {
  id: string;
  empleadoId: string;
  fechaInicio: Date;
  fechaFin: Date;
  horasTotales: number;
  tarifaPorHora: number;
  sueldoBruto: number;
  sueldoNeto: number;
  estado: EstadoQuincena;
  createdAt: Date;
  updatedAt: Date;
}

function periodoDelMes(mes: number, anio: number): { fechaInicio: Date; fechaFin: Date; hastaExclusive: Date } {
  const fechaInicio = new Date(Date.UTC(anio, mes - 1, 1));
  const hastaExclusive = new Date(Date.UTC(anio, mes, 1));
  const fechaFin = new Date(Date.UTC(anio, mes, 0));
  return { fechaInicio, fechaFin, hastaExclusive };
}

function toDTO(
  quincena: {
    id: string;
    empleadoId: string;
    fechaInicio: Date;
    fechaFin: Date;
    horasTotales: { toString(): string };
    montoTotal: { toString(): string };
    estado: EstadoQuincena;
    createdAt: Date;
    updatedAt: Date;
  },
  tarifaPorHora: number,
): QuincenaDTO {
  const horasTotales = Number(quincena.horasTotales);
  const sueldoBruto = Number(quincena.montoTotal);
  return {
    id: quincena.id,
    empleadoId: quincena.empleadoId,
    fechaInicio: quincena.fechaInicio,
    fechaFin: quincena.fechaFin,
    horasTotales,
    tarifaPorHora,
    sueldoBruto,
    sueldoNeto: sueldoBruto,
    estado: quincena.estado,
    createdAt: quincena.createdAt,
    updatedAt: quincena.updatedAt,
  };
}

export async function calcularQuincena(empleadoId: string, mes: number, anio: number): Promise<QuincenaDTO> {
  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  if (!empleado) {
    throw new NotFoundError("Empleado no encontrado");
  }

  const { fechaInicio, fechaFin, hastaExclusive } = periodoDelMes(mes, anio);
  const tarifaPorHora = Number(empleado.tarifaPorHora);

  const existing = await prisma.quincena.findUnique({
    where: { empleadoId_fechaInicio: { empleadoId, fechaInicio } },
  });

  if (existing?.estado === "pagada") {
    return toDTO(existing, tarifaPorHora);
  }

  const agregado = await prisma.horaTrabajada.aggregate({
    where: { empleadoId, fecha: { gte: fechaInicio, lt: hastaExclusive } },
    _sum: { horas: true },
  });
  const horasTotales = Number(agregado._sum.horas ?? 0);
  const sueldoBruto = horasTotales * tarifaPorHora;

  const quincena = await prisma.quincena.upsert({
    where: { empleadoId_fechaInicio: { empleadoId, fechaInicio } },
    update: { horasTotales: horasTotales.toString(), montoTotal: sueldoBruto.toString(), estado: "calculada" },
    create: {
      empleadoId,
      fechaInicio,
      fechaFin,
      horasTotales: horasTotales.toString(),
      montoTotal: sueldoBruto.toString(),
      estado: "calculada",
    },
  });

  return toDTO(quincena, tarifaPorHora);
}

export async function marcarComoPagada(id: string): Promise<QuincenaDTO> {
  const quincena = await prisma.quincena.findUnique({ where: { id }, include: { empleado: true } });
  if (!quincena) {
    throw new NotFoundError("Quincena no encontrada");
  }

  const updated = await prisma.quincena.update({ where: { id }, data: { estado: "pagada" } });
  return toDTO(updated, Number(quincena.empleado.tarifaPorHora));
}
