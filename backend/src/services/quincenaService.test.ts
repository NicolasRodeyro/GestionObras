import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import { createObra } from "./obraService";
import { createEmpleado } from "./empleadoService";
import { registrarHoras } from "./horaTrabajadaService";
import { calcularQuincena, marcarComoPagada } from "./quincenaService";

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

describe("calcularQuincena", () => {
  it("computes horas totales, sueldo bruto and sueldo neto for the period", async () => {
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 5)), horas: 80 }, userId);
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 20)), horas: 80 }, userId);

    const quincena = await calcularQuincena(empleadoId, 8, 2026);

    expect(quincena.horasTotales).toBe(160);
    expect(quincena.tarifaPorHora).toBe(250);
    expect(quincena.sueldoBruto).toBe(40000);
    expect(quincena.sueldoNeto).toBe(40000);
    expect(quincena.estado).toBe("calculada");
  });

  it("excludes hours outside the given month", async () => {
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 15)), horas: 8 }, userId);
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 8, 1)), horas: 8 }, userId);

    const quincena = await calcularQuincena(empleadoId, 8, 2026);

    expect(quincena.horasTotales).toBe(8);
  });

  it("recalculating the same period updates the same record", async () => {
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 5)), horas: 40 }, userId);
    const first = await calcularQuincena(empleadoId, 8, 2026);

    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 10)), horas: 40 }, userId);
    const second = await calcularQuincena(empleadoId, 8, 2026);

    expect(second.id).toBe(first.id);
    expect(second.horasTotales).toBe(80);
  });

  it("does not overwrite an already paid quincena", async () => {
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 5)), horas: 40 }, userId);
    const calculada = await calcularQuincena(empleadoId, 8, 2026);
    await marcarComoPagada(calculada.id);

    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 10)), horas: 40 }, userId);
    const recalculada = await calcularQuincena(empleadoId, 8, 2026);

    expect(recalculada.estado).toBe("pagada");
    expect(recalculada.horasTotales).toBe(40);
  });

  it("throws NotFoundError when the empleado does not exist", async () => {
    await expect(
      calcularQuincena("00000000-0000-0000-0000-000000000099", 8, 2026),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("marcarComoPagada", () => {
  it("marks the quincena as pagada", async () => {
    await registrarHoras(empleadoId, { obraId, fecha: new Date(Date.UTC(2026, 7, 5)), horas: 40 }, userId);
    const calculada = await calcularQuincena(empleadoId, 8, 2026);

    const pagada = await marcarComoPagada(calculada.id);

    expect(pagada.estado).toBe("pagada");
  });

  it("throws NotFoundError when the quincena does not exist", async () => {
    await expect(marcarComoPagada("00000000-0000-0000-0000-000000000099")).rejects.toThrow(
      NotFoundError,
    );
  });
});
