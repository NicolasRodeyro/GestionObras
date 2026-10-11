import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../test-utils/db";
import { registerUser, loginUser, AuthError } from "./authService";
import { verifyToken } from "../utils/jwt";

beforeEach(async () => {
  await resetDb();
});

describe("registerUser", () => {
  it("creates a user and returns a valid token", async () => {
    const { user, token } = await registerUser({
      email: "nueva@obra.com",
      password: "supersecret123",
      nombre: "Nueva Obra",
    });

    expect(user.email).toBe("nueva@obra.com");
    expect(user.nombre).toBe("Nueva Obra");
    expect(user.rol).toBe("empleado");
    expect((user as any).passwordHash).toBeUndefined();

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(user.id);
  });

  it("rejects duplicate emails", async () => {
    await registerUser({ email: "dup@obra.com", password: "supersecret123", nombre: "A" });

    await expect(
      registerUser({ email: "dup@obra.com", password: "otherpassword", nombre: "B" }),
    ).rejects.toThrow(AuthError);
  });
});

describe("loginUser", () => {
  it("logs in with correct credentials", async () => {
    await registerUser({ email: "login@obra.com", password: "supersecret123", nombre: "Login User" });

    const { user, token } = await loginUser({ email: "login@obra.com", password: "supersecret123" });

    expect(user.email).toBe("login@obra.com");
    expect(typeof token).toBe("string");
  });

  it("rejects a wrong password", async () => {
    await registerUser({ email: "wrong@obra.com", password: "supersecret123", nombre: "Wrong Pass" });

    await expect(
      loginUser({ email: "wrong@obra.com", password: "incorrecta" }),
    ).rejects.toThrow(AuthError);
  });

  it("rejects a nonexistent email", async () => {
    await expect(
      loginUser({ email: "noexiste@obra.com", password: "cualquiera123" }),
    ).rejects.toThrow(AuthError);
  });
});
