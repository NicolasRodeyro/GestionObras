import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { prisma } from "../utils/prisma";
import { NotFoundError } from "../utils/errors";
import {
  createObra,
  deleteObra,
  getObraById,
  listObras,
  updateObra,
} from "./obraService";

let userId: string;

beforeEach(async () => {
  await resetDb();
  const user = await prisma.user.create({
    data: { email: "owner@obra.com", passwordHash: "x", nombre: "Owner" },
  });
  userId = user.id;
});

describe("createObra", () => {
  it("creates an obra with default estado and the given owner", async () => {
    const obra = await createObra(
      { nombre: "Edificio Central", presupuesto: 150000.5 },
      userId,
    );

    expect(obra.nombre).toBe("Edificio Central");
    expect(obra.estado).toBe("planificada");
    expect(obra.presupuesto).toBe(150000.5);
    expect(obra.userId).toBe(userId);
  });
});

describe("listObras", () => {
  it("returns all obras ordered by most recently created", async () => {
    await createObra({ nombre: "Primera", presupuesto: 100 }, userId);
    await createObra({ nombre: "Segunda", presupuesto: 200 }, userId);

    const obras = await listObras();

    expect(obras).toHaveLength(2);
    expect(obras[0].nombre).toBe("Segunda");
    expect(obras[1].nombre).toBe("Primera");
  });
});

describe("getObraById", () => {
  it("returns the obra when it exists", async () => {
    const created = await createObra({ nombre: "Torre Norte", presupuesto: 500 }, userId);

    const obra = await getObraById(created.id);

    expect(obra.id).toBe(created.id);
  });

  it("throws NotFoundError when it does not exist", async () => {
    await expect(getObraById("00000000-0000-0000-0000-000000000099")).rejects.toThrow(
      NotFoundError,
    );
  });
});

describe("updateObra", () => {
  it("updates the given fields", async () => {
    const created = await createObra({ nombre: "Casa Sur", presupuesto: 300 }, userId);

    const updated = await updateObra(created.id, { nombre: "Casa Sur Remodelada", estado: "en_progreso" });

    expect(updated.nombre).toBe("Casa Sur Remodelada");
    expect(updated.estado).toBe("en_progreso");
    expect(updated.presupuesto).toBe(300);
  });

  it("throws NotFoundError when the obra does not exist", async () => {
    await expect(
      updateObra("00000000-0000-0000-0000-000000000099", { nombre: "X" }),
    ).rejects.toThrow(NotFoundError);
  });
});

describe("deleteObra", () => {
  it("deletes the obra", async () => {
    const created = await createObra({ nombre: "Deposito", presupuesto: 10 }, userId);

    await deleteObra(created.id);

    await expect(getObraById(created.id)).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the obra does not exist", async () => {
    await expect(deleteObra("00000000-0000-0000-0000-000000000099")).rejects.toThrow(
      NotFoundError,
    );
  });
});
