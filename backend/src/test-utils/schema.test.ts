import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../utils/prisma";
import { resetDb } from "./db";

beforeEach(async () => {
  await resetDb();
});

async function createUser() {
  return prisma.user.create({
    data: { email: "owner@obra.com", passwordHash: "x", nombre: "Owner" },
  });
}

describe("Prisma schema (Fase 2)", () => {
  it("creates an Obra with the expected defaults and decimal precision", async () => {
    const user = await createUser();

    const obra = await prisma.obra.create({
      data: { nombre: "Edificio Central", presupuesto: "150000.50", userId: user.id },
    });

    expect(obra.estado).toBe("planificada");
    expect(obra.presupuesto.toString()).toBe("150000.5");
  });

  it("cascades deletes from Obra to Gasto, EmpleadoObra, HoraTrabajada and Anotacion", async () => {
    const user = await createUser();
    const obra = await prisma.obra.create({
      data: { nombre: "Torre Norte", presupuesto: "1000", userId: user.id },
    });
    const empleado = await prisma.empleado.create({
      data: { nombre: "Juan Perez", tarifaPorHora: "250" },
    });

    await prisma.gasto.create({
      data: { obraId: obra.id, monto: "500", categoria: "materiales", fecha: new Date(), userId: user.id },
    });
    await prisma.anotacion.create({
      data: { obraId: obra.id, titulo: "Revisar plano", userId: user.id },
    });
    await prisma.empleadoObra.create({
      data: { obraId: obra.id, empleadoId: empleado.id },
    });
    await prisma.horaTrabajada.create({
      data: { obraId: obra.id, empleadoId: empleado.id, fecha: new Date(), horas: "8", userId: user.id },
    });

    await prisma.obra.delete({ where: { id: obra.id } });

    expect(await prisma.gasto.count({ where: { obraId: obra.id } })).toBe(0);
    expect(await prisma.anotacion.count({ where: { obraId: obra.id } })).toBe(0);
    expect(await prisma.empleadoObra.count({ where: { obraId: obra.id } })).toBe(0);
    expect(await prisma.horaTrabajada.count({ where: { obraId: obra.id } })).toBe(0);
    expect(await prisma.empleado.count({ where: { id: empleado.id } })).toBe(1);
  });

  it("enforces one EmpleadoObra assignment per empleado/obra pair", async () => {
    const user = await createUser();
    const obra = await prisma.obra.create({
      data: { nombre: "Casa Sur", presupuesto: "1000", userId: user.id },
    });
    const empleado = await prisma.empleado.create({
      data: { nombre: "Ana Gomez", tarifaPorHora: "300" },
    });

    await prisma.empleadoObra.create({ data: { obraId: obra.id, empleadoId: empleado.id } });

    await expect(
      prisma.empleadoObra.create({ data: { obraId: obra.id, empleadoId: empleado.id } }),
    ).rejects.toThrow();
  });

  it("rejects a Gasto with an invalid categoria", async () => {
    const user = await createUser();
    const obra = await prisma.obra.create({
      data: { nombre: "Deposito", presupuesto: "1000", userId: user.id },
    });

    await expect(
      prisma.gasto.create({
        data: {
          obraId: obra.id,
          monto: "10",
          categoria: "no_existe" as never,
          fecha: new Date(),
          userId: user.id,
        },
      }),
    ).rejects.toThrow();
  });
});
