import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import { createObra } from "./obraService";
import {
  createGasto,
  deleteGasto,
  listGastos,
  resumenPorCategoria,
  updateGasto,
} from "./gastoService";

let userId: string;
let obraAId: string;
let obraBId: string;

beforeEach(async () => {
  await resetDb();
  const user = await prisma.user.create({
    data: { email: "owner@obra.com", passwordHash: "x", nombre: "Owner" },
  });
  userId = user.id;
  obraAId = (await createObra({ nombre: "Obra A", presupuesto: 1000 }, userId)).id;
  obraBId = (await createObra({ nombre: "Obra B", presupuesto: 2000 }, userId)).id;
});

describe("createGasto", () => {
  it("creates a gasto for an existing obra", async () => {
    const gasto = await createGasto(
      { obraId: obraAId, monto: 500, categoria: "materiales", fecha: new Date("2026-06-01") },
      userId,
    );

    expect(gasto.monto).toBe(500);
    expect(gasto.categoria).toBe("materiales");
    expect(gasto.obraId).toBe(obraAId);
  });

  it("throws NotFoundError when the obra does not exist", async () => {
    await expect(
      createGasto(
        { obraId: "00000000-0000-0000-0000-000000000099", monto: 500, categoria: "materiales", fecha: new Date() },
        userId,
      ),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("listGastos", () => {
  beforeEach(async () => {
    await createGasto({ obraId: obraAId, monto: 100, categoria: "materiales", fecha: new Date("2026-06-01") }, userId);
    await createGasto({ obraId: obraAId, monto: 200, categoria: "mano_obra", fecha: new Date("2026-06-10") }, userId);
    await createGasto({ obraId: obraBId, monto: 50, categoria: "materiales", fecha: new Date("2026-06-15") }, userId);
  });

  it("lists all gastos with the total sum", async () => {
    const { gastos, total } = await listGastos({});

    expect(gastos).toHaveLength(3);
    expect(total).toBe(350);
  });

  it("filters by obraId", async () => {
    const { gastos, total } = await listGastos({ obraId: obraAId });

    expect(gastos).toHaveLength(2);
    expect(total).toBe(300);
  });

  it("filters by categoria", async () => {
    const { gastos, total } = await listGastos({ categoria: "materiales" });

    expect(gastos).toHaveLength(2);
    expect(total).toBe(150);
  });

  it("filters by date range", async () => {
    const { gastos, total } = await listGastos({ desde: new Date("2026-06-05"), hasta: new Date("2026-06-12") });

    expect(gastos).toHaveLength(1);
    expect(total).toBe(200);
  });
});

describe("resumenPorCategoria", () => {
  it("groups totals by categoria", async () => {
    await createGasto({ obraId: obraAId, monto: 100, categoria: "materiales", fecha: new Date("2026-06-01") }, userId);
    await createGasto({ obraId: obraAId, monto: 50, categoria: "materiales", fecha: new Date("2026-06-02") }, userId);
    await createGasto({ obraId: obraAId, monto: 200, categoria: "mano_obra", fecha: new Date("2026-06-03") }, userId);

    const resumen = await resumenPorCategoria({});

    expect(resumen.materiales).toBe(150);
    expect(resumen.mano_obra).toBe(200);
  });
});

describe("updateGasto", () => {
  it("updates the given fields", async () => {
    const gasto = await createGasto(
      { obraId: obraAId, monto: 100, categoria: "materiales", fecha: new Date("2026-06-01") },
      userId,
    );

    const updated = await updateGasto(gasto.id, { monto: 999, categoria: "equipos" });

    expect(updated.monto).toBe(999);
    expect(updated.categoria).toBe("equipos");
  });

  it("throws NotFoundError when the gasto does not exist", async () => {
    await expect(
      updateGasto("00000000-0000-0000-0000-000000000099", { monto: 1 }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("deleteGasto", () => {
  it("deletes the gasto", async () => {
    const gasto = await createGasto(
      { obraId: obraAId, monto: 100, categoria: "materiales", fecha: new Date("2026-06-01") },
      userId,
    );

    await deleteGasto(gasto.id);

    const { gastos } = await listGastos({});
    expect(gastos).toHaveLength(0);
  });

  it("throws NotFoundError when the gasto does not exist", async () => {
    await expect(deleteGasto("00000000-0000-0000-0000-000000000099")).rejects.toThrow(NotFoundError);
  });
});
