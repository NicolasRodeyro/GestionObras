import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { resetDb } from "../test-utils/db";

let token: string;
let obraId: string;
let empleadoId: string;

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

  const empleado = await request(app)
    .post("/api/empleados")
    .set(authed())
    .send({ nombre: "Juan Perez", tarifaPorHora: 250 });
  empleadoId = empleado.body.empleado.id;
});

function authed() {
  return { Authorization: `Bearer ${token}` };
}

describe("GET /api/quincenas/:empleadoId", () => {
  it("calculates and returns the quincena for the given month", async () => {
    for (let day = 1; day <= 20; day++) {
      await request(app)
        .post(`/api/empleados/${empleadoId}/horas`)
        .set(authed())
        .send({ obraId, fecha: `2026-08-${String(day).padStart(2, "0")}`, horas: 8 });
    }

    const res = await request(app).get(`/api/quincenas/${empleadoId}?mes=8&anio=2026`).set(authed());

    expect(res.status).toBe(200);
    expect(res.body.quincena.horasTotales).toBe(160);
    expect(res.body.quincena.sueldoBruto).toBe(40000);
    expect(res.body.quincena.sueldoNeto).toBe(40000);
    expect(res.body.quincena.estado).toBe("calculada");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get(`/api/quincenas/${empleadoId}?mes=8&anio=2026`);
    expect(res.status).toBe(401);
  });

  it("returns 400 when mes/anio are missing", async () => {
    const res = await request(app).get(`/api/quincenas/${empleadoId}`).set(authed());
    expect(res.status).toBe(400);
  });

  it("returns 404 when the empleado does not exist", async () => {
    const res = await request(app)
      .get("/api/quincenas/11111111-1111-4111-8111-111111111111?mes=8&anio=2026")
      .set(authed());
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/quincenas/:id/pagar", () => {
  it("marks the quincena as pagada", async () => {
    await request(app)
      .post(`/api/empleados/${empleadoId}/horas`)
      .set(authed())
      .send({ obraId, fecha: "2026-08-05", horas: 40 });
    const calculo = await request(app).get(`/api/quincenas/${empleadoId}?mes=8&anio=2026`).set(authed());

    const res = await request(app).put(`/api/quincenas/${calculo.body.quincena.id}/pagar`).set(authed());

    expect(res.status).toBe(200);
    expect(res.body.quincena.estado).toBe("pagada");
  });

  it("returns 404 for a nonexistent quincena", async () => {
    const res = await request(app)
      .put("/api/quincenas/11111111-1111-4111-8111-111111111111/pagar")
      .set(authed());
    expect(res.status).toBe(404);
  });
});
