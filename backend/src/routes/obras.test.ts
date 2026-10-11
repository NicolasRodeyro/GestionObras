import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { resetDb } from "../test-utils/db";

let token: string;

beforeEach(async () => {
  await resetDb();
  const res = await request(app).post("/api/auth/register").send({
    email: "owner@obra.com",
    password: "supersecret123",
    nombre: "Owner",
  });
  token = res.body.token;
});

function authed() {
  return { Authorization: `Bearer ${token}` };
}

describe("POST /api/obras", () => {
  it("creates an obra when authenticated", async () => {
    const res = await request(app)
      .post("/api/obras")
      .set(authed())
      .send({ nombre: "Edificio Central", presupuesto: 150000 });

    expect(res.status).toBe(201);
    expect(res.body.obra.nombre).toBe("Edificio Central");
    expect(res.body.obra.estado).toBe("planificada");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/api/obras").send({ nombre: "X", presupuesto: 1 });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app).post("/api/obras").set(authed()).send({ nombre: "", presupuesto: -5 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/obras", () => {
  it("lists obras", async () => {
    await request(app).post("/api/obras").set(authed()).send({ nombre: "A", presupuesto: 1 });
    await request(app).post("/api/obras").set(authed()).send({ nombre: "B", presupuesto: 2 });

    const res = await request(app).get("/api/obras").set(authed());

    expect(res.status).toBe(200);
    expect(res.body.obras).toHaveLength(2);
  });
});

describe("GET /api/obras/:id", () => {
  it("returns the obra", async () => {
    const created = await request(app).post("/api/obras").set(authed()).send({ nombre: "A", presupuesto: 1 });

    const res = await request(app).get(`/api/obras/${created.body.obra.id}`).set(authed());

    expect(res.status).toBe(200);
    expect(res.body.obra.nombre).toBe("A");
  });

  it("returns 404 for a nonexistent obra", async () => {
    const res = await request(app)
      .get("/api/obras/00000000-0000-0000-0000-000000000099")
      .set(authed());

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/obras/:id", () => {
  it("updates the obra", async () => {
    const created = await request(app).post("/api/obras").set(authed()).send({ nombre: "A", presupuesto: 1 });

    const res = await request(app)
      .put(`/api/obras/${created.body.obra.id}`)
      .set(authed())
      .send({ nombre: "A actualizada", estado: "en_progreso" });

    expect(res.status).toBe(200);
    expect(res.body.obra.nombre).toBe("A actualizada");
    expect(res.body.obra.estado).toBe("en_progreso");
  });

  it("returns 404 for a nonexistent obra", async () => {
    const res = await request(app)
      .put("/api/obras/00000000-0000-0000-0000-000000000099")
      .set(authed())
      .send({ nombre: "X" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/obras/:id", () => {
  it("deletes the obra", async () => {
    const created = await request(app).post("/api/obras").set(authed()).send({ nombre: "A", presupuesto: 1 });

    const res = await request(app).delete(`/api/obras/${created.body.obra.id}`).set(authed());
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/obras/${created.body.obra.id}`).set(authed());
    expect(getRes.status).toBe(404);
  });

  it("returns 404 for a nonexistent obra", async () => {
    const res = await request(app)
      .delete("/api/obras/00000000-0000-0000-0000-000000000099")
      .set(authed());

    expect(res.status).toBe(404);
  });
});
