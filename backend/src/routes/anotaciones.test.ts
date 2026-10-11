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

describe("POST /api/obras/:id/anotaciones", () => {
  it("creates an anotacion for the obra", async () => {
    const res = await request(app)
      .post(`/api/obras/${obraId}/anotaciones`)
      .set(authed())
      .send({ titulo: "Revisar plano" });

    expect(res.status).toBe(201);
    expect(res.body.anotacion.titulo).toBe("Revisar plano");
    expect(res.body.anotacion.prioridad).toBe("media");
    expect(res.body.anotacion.completada).toBe(false);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post(`/api/obras/${obraId}/anotaciones`).send({ titulo: "X" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(app).post(`/api/obras/${obraId}/anotaciones`).set(authed()).send({ titulo: "" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the obra does not exist", async () => {
    const res = await request(app)
      .post("/api/obras/11111111-1111-4111-8111-111111111111/anotaciones")
      .set(authed())
      .send({ titulo: "X" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/obras/:id/anotaciones", () => {
  it("lists anotaciones for the obra", async () => {
    await request(app).post(`/api/obras/${obraId}/anotaciones`).set(authed()).send({ titulo: "Primera" });
    await request(app).post(`/api/obras/${obraId}/anotaciones`).set(authed()).send({ titulo: "Segunda" });

    const res = await request(app).get(`/api/obras/${obraId}/anotaciones`).set(authed());

    expect(res.status).toBe(200);
    expect(res.body.anotaciones).toHaveLength(2);
  });
});

describe("PUT /api/anotaciones/:id", () => {
  it("updates the anotacion, including marking it as completada", async () => {
    const created = await request(app)
      .post(`/api/obras/${obraId}/anotaciones`)
      .set(authed())
      .send({ titulo: "Revisar plano" });

    const res = await request(app)
      .put(`/api/anotaciones/${created.body.anotacion.id}`)
      .set(authed())
      .send({ completada: true, prioridad: "alta" });

    expect(res.status).toBe(200);
    expect(res.body.anotacion.completada).toBe(true);
    expect(res.body.anotacion.prioridad).toBe("alta");
  });

  it("returns 404 for a nonexistent anotacion", async () => {
    const res = await request(app)
      .put("/api/anotaciones/11111111-1111-4111-8111-111111111111")
      .set(authed())
      .send({ completada: true });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/anotaciones/:id", () => {
  it("deletes the anotacion", async () => {
    const created = await request(app)
      .post(`/api/obras/${obraId}/anotaciones`)
      .set(authed())
      .send({ titulo: "Revisar plano" });

    const res = await request(app).delete(`/api/anotaciones/${created.body.anotacion.id}`).set(authed());
    expect(res.status).toBe(204);

    const list = await request(app).get(`/api/obras/${obraId}/anotaciones`).set(authed());
    expect(list.body.anotaciones).toHaveLength(0);
  });

  it("returns 404 for a nonexistent anotacion", async () => {
    const res = await request(app)
      .delete("/api/anotaciones/11111111-1111-4111-8111-111111111111")
      .set(authed());
    expect(res.status).toBe(404);
  });
});
