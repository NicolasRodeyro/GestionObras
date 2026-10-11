import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import { createObra } from "./obraService";
import {
  createAnotacion,
  deleteAnotacion,
  listAnotacionesByObra,
  updateAnotacion,
} from "./anotacionService";

let userId: string;
let obraId: string;

beforeEach(async () => {
  await resetDb();
  const user = await prisma.user.create({
    data: { email: "owner@obra.com", passwordHash: "x", nombre: "Owner" },
  });
  userId = user.id;
  obraId = (await createObra({ nombre: "Obra A", presupuesto: 1000 }, userId)).id;
});

describe("createAnotacion", () => {
  it("creates an anotacion with default prioridad and completada false", async () => {
    const anotacion = await createAnotacion(obraId, { titulo: "Revisar plano" }, userId);

    expect(anotacion.titulo).toBe("Revisar plano");
    expect(anotacion.prioridad).toBe("media");
    expect(anotacion.completada).toBe(false);
    expect(anotacion.obraId).toBe(obraId);
  });

  it("throws NotFoundError when the obra does not exist", async () => {
    await expect(
      createAnotacion("00000000-0000-0000-0000-000000000099", { titulo: "X" }, userId),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("listAnotacionesByObra", () => {
  it("returns anotaciones for the given obra ordered by most recent", async () => {
    await createAnotacion(obraId, { titulo: "Primera" }, userId);
    await createAnotacion(obraId, { titulo: "Segunda" }, userId);

    const anotaciones = await listAnotacionesByObra(obraId);

    expect(anotaciones).toHaveLength(2);
    expect(anotaciones[0].titulo).toBe("Segunda");
  });

  it("throws NotFoundError when the obra does not exist", async () => {
    await expect(listAnotacionesByObra("00000000-0000-0000-0000-000000000099")).rejects.toThrow(
      NotFoundError,
    );
  });
});

describe("updateAnotacion", () => {
  it("updates titulo, prioridad and completada", async () => {
    const created = await createAnotacion(obraId, { titulo: "Revisar plano" }, userId);

    const updated = await updateAnotacion(created.id, {
      titulo: "Revisar plano estructural",
      prioridad: "alta",
      completada: true,
    });

    expect(updated.titulo).toBe("Revisar plano estructural");
    expect(updated.prioridad).toBe("alta");
    expect(updated.completada).toBe(true);
  });

  it("throws NotFoundError when the anotacion does not exist", async () => {
    await expect(
      updateAnotacion("00000000-0000-0000-0000-000000000099", { titulo: "X" }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("deleteAnotacion", () => {
  it("deletes the anotacion", async () => {
    const created = await createAnotacion(obraId, { titulo: "Revisar plano" }, userId);

    await deleteAnotacion(created.id);

    const anotaciones = await listAnotacionesByObra(obraId);
    expect(anotaciones).toHaveLength(0);
  });

  it("throws NotFoundError when the anotacion does not exist", async () => {
    await expect(deleteAnotacion("00000000-0000-0000-0000-000000000099")).rejects.toThrow(
      NotFoundError,
    );
  });
});
