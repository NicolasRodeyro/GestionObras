import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import type { Prioridad } from "../generated/prisma/client";

export interface AnotacionDTO {
  id: string;
  obraId: string;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  completada: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnotacionInput {
  titulo: string;
  descripcion?: string;
  prioridad?: Prioridad;
}

export interface UpdateAnotacionInput {
  titulo?: string;
  descripcion?: string;
  prioridad?: Prioridad;
  completada?: boolean;
}

export async function createAnotacion(
  obraId: string,
  input: CreateAnotacionInput,
  userId: string,
): Promise<AnotacionDTO> {
  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra) {
    throw new NotFoundError("Obra no encontrada");
  }

  return prisma.anotacion.create({ data: { ...input, obraId, userId } });
}

export async function listAnotacionesByObra(obraId: string): Promise<AnotacionDTO[]> {
  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra) {
    throw new NotFoundError("Obra no encontrada");
  }

  return prisma.anotacion.findMany({ where: { obraId }, orderBy: { createdAt: "desc" } });
}

export async function updateAnotacion(id: string, input: UpdateAnotacionInput): Promise<AnotacionDTO> {
  const exists = await prisma.anotacion.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Anotación no encontrada");
  }

  return prisma.anotacion.update({ where: { id }, data: input });
}

export async function deleteAnotacion(id: string): Promise<void> {
  const exists = await prisma.anotacion.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Anotación no encontrada");
  }
  await prisma.anotacion.delete({ where: { id } });
}
