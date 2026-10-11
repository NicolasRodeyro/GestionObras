import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import type { CategoriaGasto } from "../generated/prisma/client";

export interface GastoDTO {
  id: string;
  obraId: string;
  monto: number;
  categoria: CategoriaGasto;
  detalle: string | null;
  fecha: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GastoRecord {
  id: string;
  obraId: string;
  monto: { toString(): string };
  categoria: CategoriaGasto;
  detalle: string | null;
  fecha: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDTO(gasto: GastoRecord): GastoDTO {
  return { ...gasto, monto: Number(gasto.monto) };
}

export interface CreateGastoInput {
  obraId: string;
  monto: number;
  categoria: CategoriaGasto;
  detalle?: string;
  fecha: Date;
}

export type UpdateGastoInput = Partial<CreateGastoInput>;

export interface GastoFilters {
  obraId?: string;
  categoria?: CategoriaGasto;
  desde?: Date;
  hasta?: Date;
}

function buildWhere(filters: GastoFilters) {
  return {
    ...(filters.obraId ? { obraId: filters.obraId } : {}),
    ...(filters.categoria ? { categoria: filters.categoria } : {}),
    ...(filters.desde || filters.hasta
      ? {
          fecha: {
            ...(filters.desde ? { gte: filters.desde } : {}),
            ...(filters.hasta ? { lte: filters.hasta } : {}),
          },
        }
      : {}),
  };
}

export async function createGasto(input: CreateGastoInput, userId: string): Promise<GastoDTO> {
  const obra = await prisma.obra.findUnique({ where: { id: input.obraId } });
  if (!obra) {
    throw new NotFoundError("Obra no encontrada");
  }

  const gasto = await prisma.gasto.create({
    data: { ...input, monto: input.monto.toString(), userId },
  });
  return toDTO(gasto);
}

export async function listGastos(filters: GastoFilters): Promise<{ gastos: GastoDTO[]; total: number }> {
  const gastos = await prisma.gasto.findMany({
    where: buildWhere(filters),
    orderBy: { fecha: "desc" },
  });
  const dtos = gastos.map(toDTO);
  const total = dtos.reduce((sum, g) => sum + g.monto, 0);
  return { gastos: dtos, total };
}

export async function resumenPorCategoria(
  filters: Omit<GastoFilters, "categoria">,
): Promise<Record<string, number>> {
  const grouped = await prisma.gasto.groupBy({
    by: ["categoria"],
    where: buildWhere(filters),
    _sum: { monto: true },
  });

  const resumen: Record<string, number> = {};
  for (const row of grouped) {
    resumen[row.categoria] = Number(row._sum.monto ?? 0);
  }
  return resumen;
}

export async function updateGasto(id: string, input: UpdateGastoInput): Promise<GastoDTO> {
  const exists = await prisma.gasto.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Gasto no encontrado");
  }

  if (input.obraId) {
    const obra = await prisma.obra.findUnique({ where: { id: input.obraId } });
    if (!obra) {
      throw new NotFoundError("Obra no encontrada");
    }
  }

  const { monto, ...rest } = input;
  const gasto = await prisma.gasto.update({
    where: { id },
    data: { ...rest, ...(monto !== undefined ? { monto: monto.toString() } : {}) },
  });
  return toDTO(gasto);
}

export async function deleteGasto(id: string): Promise<void> {
  const exists = await prisma.gasto.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Gasto no encontrado");
  }
  await prisma.gasto.delete({ where: { id } });
}
