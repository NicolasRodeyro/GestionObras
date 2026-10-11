import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { resetDb } from "../test-utils/db";

let token: string;
let obraAId: string;
let obraBId: string;

beforeEach(async () => {
  await resetDb();
  const register = await request(app).post("/api/auth/register").send({
    email: "owner@obra.com",
    password: "supersecret123",
    nombre: "Owner",
  });
  token = register.body.token;

  const obraA = await request(app).post("/api/obras").set(authed()).send({ nombre: "Obra A", presupuesto: 1000 });
  const obraB = await request(app).post("/api/obras").set(authed()).send({ nombre: "Obra B", presupuesto: 2000 });
  obraAId = obraA.body.obra.id;
  obraBId = obraB.body.obra.id;
});

function authed() {
  return { Authorization: `Bearer ${token}` };
}

describe("POST /api/gastos", () => {
  it("creates a gasto", async () => {
    const res = await request(app)
      .post("/api/gastos")
      .set(authed())
      .send({ obraId: obraAId, monto: 500, categoria: "materiales", fecha: "2026-06-01" });

    expect(res.status).toBe(201);
    expect(res.body.gasto.monto).toBe(500);
    expect(res.body.gasto.obraId).toBe(obraAId);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/gastos")
      .send({ obraId: obraAId, monto: 500, categoria: "materiales", fecha: "2026-06-01" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app)
      .post("/api/gastos")
      .set(authed())
      .send({ obraId: obraAId, monto: -5, categoria: "no_existe", fecha: "2026-06-01" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the obra does not exist", async () => {
    const res = await request(app)
      .post("/api/gastos")
      .set(authed())
      .send({ obraId: "11111111-1111-4111-8111-111111111111", monto: 5, categoria: "materiales", fecha: "2026-06-01" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/gastos", () => {
  beforeEach(async () => {
    await request(app).post("/api/gastos").set(authed()).send({ obraId: obraAId, monto: 100, categoria: "materiales", fecha: "2026-06-01" });
    await request(app).post("/api/gastos").set(authed()).send({ obraId: obraBId, monto: 200, categoria: "mano_obra", fecha: "2026-06-10" });
  });

  it("lists all gastos with total", async () => {
    const res = await request(app).get("/api/gastos").set(authed());

    expect(res.status).toBe(200);
    expect(res.body.gastos).toHaveLength(2);
    expect(res.body.total).toBe(300);
  });

  it("filters by obraId", async () => {
    const res = await request(app).get(`/api/gastos?obraId=${obraAId}`).set(authed());

    expect(res.status).toBe(200);
    expect(res.body.gastos).toHaveLength(1);
    expect(res.body.total).toBe(100);
  });
});

describe("GET /api/gastos/resumen", () => {
  it("returns totals grouped by categoria", async () => {
    await request(app).post("/api/gastos").set(authed()).send({ obraId: obraAId, monto: 100, categoria: "materiales", fecha: "2026-06-01" });
    await request(app).post("/api/gastos").set(authed()).send({ obraId: obraAId, monto: 50, categoria: "materiales", fecha: "2026-06-02" });

    const res = await request(app).get("/api/gastos/resumen").set(authed());

    expect(res.status).toBe(200);
    expect(res.body.porCategoria.materiales).toBe(150);
  });
});

describe("PUT /api/gastos/:id", () => {
  it("updates the gasto", async () => {
    const created = await request(app).post("/api/gastos").set(authed()).send({ obraId: obraAId, monto: 100, categoria: "materiales", fecha: "2026-06-01" });

    const res = await request(app).put(`/api/gastos/${created.body.gasto.id}`).set(authed()).send({ monto: 999 });

    expect(res.status).toBe(200);
    expect(res.body.gasto.monto).toBe(999);
  });

  it("returns 404 for a nonexistent gasto", async () => {
    const res = await request(app)
      .put("/api/gastos/00000000-0000-0000-0000-000000000099")
      .set(authed())
      .send({ monto: 1 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/gastos/:id", () => {
  it("deletes the gasto", async () => {
    const created = await request(app).post("/api/gastos").set(authed()).send({ obraId: obraAId, monto: 100, categoria: "materiales", fecha: "2026-06-01" });

    const res = await request(app).delete(`/api/gastos/${created.body.gasto.id}`).set(authed());
    expect(res.status).toBe(204);

    const list = await request(app).get("/api/gastos").set(authed());
    expect(list.body.gastos).toHaveLength(0);
  });

  it("returns 404 for a nonexistent gasto", async () => {
    const res = await request(app).delete("/api/gastos/00000000-0000-0000-0000-000000000099").set(authed());
    expect(res.status).toBe(404);
  });
});
