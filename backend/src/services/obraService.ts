import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import type { EstadoObra } from "../generated/prisma/client";

export interface ObraDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: EstadoObra;
  presupuesto: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ObraRecord {
  id: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: EstadoObra;
  presupuesto: { toString(): string };
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDTO(obra: ObraRecord): ObraDTO {
  return { ...obra, presupuesto: Number(obra.presupuesto) };
}

export interface CreateObraInput {
  nombre: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: EstadoObra;
  presupuesto: number;
}

export type UpdateObraInput = Partial<CreateObraInput>;

export async function createObra(input: CreateObraInput, userId: string): Promise<ObraDTO> {
  const obra = await prisma.obra.create({
    data: { ...input, presupuesto: input.presupuesto.toString(), userId },
  });
  return toDTO(obra);
}

export async function listObras(): Promise<ObraDTO[]> {
  const obras = await prisma.obra.findMany({ orderBy: { createdAt: "desc" } });
  return obras.map(toDTO);
}

export async function getObraById(id: string): Promise<ObraDTO> {
  const obra = await prisma.obra.findUnique({ where: { id } });
  if (!obra) {
    throw new NotFoundError("Obra no encontrada");
  }
  return toDTO(obra);
}

export async function updateObra(id: string, input: UpdateObraInput): Promise<ObraDTO> {
  const exists = await prisma.obra.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Obra no encontrada");
  }

  const { presupuesto, ...rest } = input;
  const obra = await prisma.obra.update({
    where: { id },
    data: { ...rest, ...(presupuesto !== undefined ? { presupuesto: presupuesto.toString() } : {}) },
  });
  return toDTO(obra);
}

export async function deleteObra(id: string): Promise<void> {
  const exists = await prisma.obra.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Obra no encontrada");
  }
  await prisma.obra.delete({ where: { id } });
}
