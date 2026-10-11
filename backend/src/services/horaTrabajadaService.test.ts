import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import { createObra } from "./obraService";
import { createEmpleado } from "./empleadoService";
import { listHorasByEmpleado, registrarHoras } from "./horaTrabajadaService";

let userId: string;
let obraId: string;
let empleadoId: string;

beforeEach(async () => {
  await resetDb();
  const user = await prisma.user.create({
    data: { email: "owner@obra.com", passwordHash: "x", nombre: "Owner" },
  });
  userId = user.id;
  obraId = (await createObra({ nombre: "Obra A", presupuesto: 1000 }, userId)).id;
  empleadoId = (await createEmpleado({ nombre: "Juan Perez", tarifaPorHora: 250 })).id;
});

describe("registrarHoras", () => {
  it("registers hours for an existing empleado and obra", async () => {
    const registro = await registrarHoras(
      empleadoId,
      { obraId, fecha: new Date("2026-08-03"), horas: 8 },
      userId,
    );

    expect(registro.horas).toBe(8);
    expect(registro.empleadoId).toBe(empleadoId);
    expect(registro.obraId).toBe(obraId);
  });

  it("throws NotFoundError when the empleado does not exist", async () => {
    await expect(
      registrarHoras(
        "00000000-0000-0000-0000-000000000099",
        { obraId, fecha: new Date(), horas: 8 },
        userId,
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the obra does not exist", async () => {
    await expect(
      registrarHoras(
        empleadoId,
        { obraId: "00000000-0000-0000-0000-000000000099", fecha: new Date(), horas: 8 },
        userId,
      ),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("listHorasByEmpleado", () => {
  it("returns hours, total and sueldo estimado for a given month", async () => {
    for (let day = 1; day <= 20; day++) {
      await registrarHoras(empleadoId, { obraId, fecha: new Date(2026, 7, day), horas: 8 }, userId);
    }
    // 20 days * 8 = 160 hours at $250/hour => $40000

    const { horasDetalle, totalHoras, sueldoEstimado } = await listHorasByEmpleado(empleadoId, {
      mes: 8,
      anio: 2026,
    });

    expect(horasDetalle).toHaveLength(20);
    expect(totalHoras).toBe(160);
    expect(sueldoEstimado).toBe(40000);
  });

  it("excludes hours from other months", async () => {
    await registrarHoras(empleadoId, { obraId, fecha: new Date(2026, 7, 15), horas: 8 }, userId);
    await registrarHoras(empleadoId, { obraId, fecha: new Date(2026, 8, 1), horas: 8 }, userId);

    const { totalHoras } = await listHorasByEmpleado(empleadoId, { mes: 8, anio: 2026 });

    expect(totalHoras).toBe(8);
  });

  it("throws NotFoundError when the empleado does not exist", async () => {
    await expect(
      listHorasByEmpleado("00000000-0000-0000-0000-000000000099", { mes: 8, anio: 2026 }),
    ).rejects.toThrow(NotFoundError);
  });
});
