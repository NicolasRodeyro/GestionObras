import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { NotFoundError } from "../utils/errors";
import {
  createEmpleado,
  getEmpleadoById,
  listEmpleados,
  updateEmpleado,
} from "./empleadoService";

beforeEach(async () => {
  await resetDb();
});

describe("createEmpleado", () => {
  it("creates an empleado with default estado activo", async () => {
    const empleado = await createEmpleado({ nombre: "Juan Perez", tarifaPorHora: 250 });

    expect(empleado.nombre).toBe("Juan Perez");
    expect(empleado.estado).toBe("activo");
    expect(empleado.tarifaPorHora).toBe(250);
  });

  it("creates an empleado with optional email and dni", async () => {
    const empleado = await createEmpleado({
      nombre: "Ana Gomez",
      email: "ana@obra.com",
      dni: "30111222",
      tarifaPorHora: 300,
    });

    expect(empleado.email).toBe("ana@obra.com");
    expect(empleado.dni).toBe("30111222");
  });
});

describe("listEmpleados", () => {
  it("returns all empleados", async () => {
    await createEmpleado({ nombre: "Primero", tarifaPorHora: 100 });
    await createEmpleado({ nombre: "Segundo", tarifaPorHora: 200 });

    const empleados = await listEmpleados();

    expect(empleados).toHaveLength(2);
  });
});

describe("getEmpleadoById", () => {
  it("returns the empleado when it exists", async () => {
    const created = await createEmpleado({ nombre: "Juan Perez", tarifaPorHora: 250 });

    const empleado = await getEmpleadoById(created.id);

    expect(empleado.id).toBe(created.id);
  });

  it("throws NotFoundError when it does not exist", async () => {
    await expect(getEmpleadoById("00000000-0000-0000-0000-000000000099")).rejects.toThrow(
      NotFoundError,
    );
  });
});

describe("updateEmpleado", () => {
  it("updates the given fields", async () => {
    const created = await createEmpleado({ nombre: "Juan Perez", tarifaPorHora: 250 });

    const updated = await updateEmpleado(created.id, { tarifaPorHora: 300, estado: "inactivo" });

    expect(updated.tarifaPorHora).toBe(300);
    expect(updated.estado).toBe("inactivo");
  });

  it("throws NotFoundError when the empleado does not exist", async () => {
    await expect(
      updateEmpleado("00000000-0000-0000-0000-000000000099", { nombre: "X" }),
    ).rejects.toThrow(NotFoundError);
  });
});
