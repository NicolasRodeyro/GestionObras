import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { resetDb } from "../test-utils/db";

let token: string;
let obraId: string;

beforeEach(async () => {
  await resetDb();
  const register = await request(app).post("/api/auth/register").send({
    email: "owner@obra.com",
    password: "supersecret123",
    nombre: "Owner",
  });
  token = register.body.token;

  const obra = await request(app).post("/api/obras").set(authed()).send({ nombre: "Obra A", presupuesto: 1000 });
  obraId = obra.body.obra.id;
});

function authed() {
  return { Authorization: `Bearer ${token}` };
}

describe("POST /api/empleados", () => {
  it("creates an empleado when authenticated", async () => {
    const res = await request(app)
      .post("/api/empleados")
      .set(authed())
      .send({ nombre: "Juan Perez", tarifaPorHora: 250 });

    expect(res.status).toBe(201);
    expect(res.body.empleado.nombre).toBe("Juan Perez");
    expect(res.body.empleado.estado).toBe("activo");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/api/empleados").send({ nombre: "X", tarifaPorHora: 1 });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app)
      .post("/api/empleados")
      .set(authed())
      .send({ nombre: "", tarifaPorHora: -5 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/empleados", () => {
  it("lists empleados", async () => {
    await request(app).post("/api/empleados").set(authed()).send({ nombre: "A", tarifaPorHora: 100 });
    await request(app).post("/api/empleados").set(authed()).send({ nombre: "B", tarifaPorHora: 200 });

    const res = await request(app).get("/api/empleados").set(authed());

    expect(res.status).toBe(200);
    expect(res.body.empleados).toHaveLength(2);
  });
});

describe("PUT /api/empleados/:id", () => {
  it("updates the empleado", async () => {
    const created = await request(app).post("/api/empleados").set(authed()).send({ nombre: "A", tarifaPorHora: 100 });

    const res = await request(app)
      .put(`/api/empleados/${created.body.empleado.id}`)
      .set(authed())
      .send({ tarifaPorHora: 300, estado: "inactivo" });

    expect(res.status).toBe(200);
    expect(res.body.empleado.tarifaPorHora).toBe(300);
    expect(res.body.empleado.estado).toBe("inactivo");
  });

  it("returns 404 for a nonexistent empleado", async () => {
    const res = await request(app)
      .put("/api/empleados/11111111-1111-4111-8111-111111111111")
      .set(authed())
      .send({ nombre: "X" });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/empleados/:id/horas", () => {
  it("registers hours for an empleado", async () => {
    const empleado = await request(app).post("/api/empleados").set(authed()).send({ nombre: "A", tarifaPorHora: 250 });

    const res = await request(app)
      .post(`/api/empleados/${empleado.body.empleado.id}/horas`)
      .set(authed())
      .send({ obraId, fecha: "2026-08-03", horas: 8 });

    expect(res.status).toBe(201);
    expect(res.body.registro.horas).toBe(8);
  });

  it("returns 404 when the empleado does not exist", async () => {
    const res = await request(app)
      .post("/api/empleados/11111111-1111-4111-8111-111111111111/horas")
      .set(authed())
      .send({ obraId, fecha: "2026-08-03", horas: 8 });
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid input", async () => {
    const empleado = await request(app).post("/api/empleados").set(authed()).send({ nombre: "A", tarifaPorHora: 250 });

    const res = await request(app)
      .post(`/api/empleados/${empleado.body.empleado.id}/horas`)
      .set(authed())
      .send({ obraId, fecha: "2026-08-03", horas: -1 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/empleados/:id/horas", () => {
  it("returns hours, total and sueldo estimado for the given month", async () => {
    const empleado = await request(app).post("/api/empleados").set(authed()).send({ nombre: "A", tarifaPorHora: 250 });
    const empleadoId = empleado.body.empleado.id;

    for (let day = 1; day <= 20; day++) {
      await request(app)
        .post(`/api/empleados/${empleadoId}/horas`)
        .set(authed())
        .send({ obraId, fecha: `2026-08-${String(day).padStart(2, "0")}`, horas: 8 });
    }

    const res = await request(app).get(`/api/empleados/${empleadoId}/horas?mes=8&anio=2026`).set(authed());

    expect(res.status).toBe(200);
    expect(res.body.horasDetalle).toHaveLength(20);
    expect(res.body.totalHoras).toBe(160);
    expect(res.body.sueldoEstimado).toBe(40000);
  });

  it("returns 400 when mes/anio are missing", async () => {
    const empleado = await request(app).post("/api/empleados").set(authed()).send({ nombre: "A", tarifaPorHora: 250 });

    const res = await request(app).get(`/api/empleados/${empleado.body.empleado.id}/horas`).set(authed());
    expect(res.status).toBe(400);
  });
});
