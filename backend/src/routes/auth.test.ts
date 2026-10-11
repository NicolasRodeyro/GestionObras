import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";
import { resetDb } from "../test-utils/db";

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns token + user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@obra.com",
      password: "supersecret123",
      nombre: "Test User",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("test@obra.com");
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(typeof res.body.token).toBe("string");
  });

  it("returns 400 for invalid input (short password)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test2@obra.com",
      password: "123",
      nombre: "Test",
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "supersecret123",
      nombre: "Test",
    });

    expect(res.status).toBe(400);
  });

  it("returns 409 when the email is already registered", async () => {
    await request(app).post("/api/auth/register").send({
      email: "dup@obra.com",
      password: "supersecret123",
      nombre: "A",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "dup@obra.com",
      password: "otherpassword",
      nombre: "B",
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({
      email: "login@obra.com",
      password: "supersecret123",
      nombre: "Login",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@obra.com",
      password: "supersecret123",
    });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("returns 401 for wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      email: "login2@obra.com",
      password: "supersecret123",
      nombre: "Login2",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login2@obra.com",
      password: "incorrecta",
    });

    expect(res.status).toBe(401);
  });

  it("returns 401 for nonexistent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "noexiste@obra.com",
      password: "cualquiera123",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user when authenticated", async () => {
    const register = await request(app).post("/api/auth/register").send({
      email: "me@obra.com",
      password: "supersecret123",
      nombre: "Me User",
    });
    const token = register.body.token;

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@obra.com");
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});
