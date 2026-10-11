import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import type { EstadoEmpleado } from "../generated/prisma/client";

export interface EmpleadoDTO {
  id: string;
  nombre: string;
  email: string | null;
  dni: string | null;
  tarifaPorHora: number;
  estado: EstadoEmpleado;
  createdAt: Date;
  updatedAt: Date;
}

interface EmpleadoRecord {
  id: string;
  nombre: string;
  email: string | null;
  dni: string | null;
  tarifaPorHora: { toString(): string };
  estado: EstadoEmpleado;
  createdAt: Date;
  updatedAt: Date;
}

function toDTO(empleado: EmpleadoRecord): EmpleadoDTO {
  return { ...empleado, tarifaPorHora: Number(empleado.tarifaPorHora) };
}

export interface CreateEmpleadoInput {
  nombre: string;
  email?: string;
  dni?: string;
  tarifaPorHora: number;
  estado?: EstadoEmpleado;
}

export type UpdateEmpleadoInput = Partial<CreateEmpleadoInput>;

export async function createEmpleado(input: CreateEmpleadoInput): Promise<EmpleadoDTO> {
  const empleado = await prisma.empleado.create({
    data: { ...input, tarifaPorHora: input.tarifaPorHora.toString() },
  });
  return toDTO(empleado);
}

export async function listEmpleados(): Promise<EmpleadoDTO[]> {
  const empleados = await prisma.empleado.findMany({ orderBy: { nombre: "asc" } });
  return empleados.map(toDTO);
}

export async function getEmpleadoById(id: string): Promise<EmpleadoDTO> {
  const empleado = await prisma.empleado.findUnique({ where: { id } });
  if (!empleado) {
    throw new NotFoundError("Empleado no encontrado");
  }
  return toDTO(empleado);
}

export async function updateEmpleado(id: string, input: UpdateEmpleadoInput): Promise<EmpleadoDTO> {
  const exists = await prisma.empleado.findUnique({ where: { id } });
  if (!exists) {
    throw new NotFoundError("Empleado no encontrado");
  }

  const { tarifaPorHora, ...rest } = input;
  const empleado = await prisma.empleado.update({
    where: { id },
    data: { ...rest, ...(tarifaPorHora !== undefined ? { tarifaPorHora: tarifaPorHora.toString() } : {}) },
  });
  return toDTO(empleado);
}
