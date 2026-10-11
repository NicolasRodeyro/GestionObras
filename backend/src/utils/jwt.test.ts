import { describe, expect, it } from "vitest";
import { generateToken, verifyToken } from "./jwt";

describe("jwt utils", () => {
  it("generates a token that can be verified back to the same payload", () => {
    const payload = { userId: "abc-123", rol: "admin" as const };

    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.rol).toBe(payload.rol);
  });

  it("throws when verifying an invalid token", () => {
    expect(() => verifyToken("not-a-valid-token")).toThrow();
  });

  it("throws when verifying a token signed with a different secret", () => {
    const token = generateToken({ userId: "abc-123", rol: "admin" as const }, "other-secret-key-min-32-characters");

    expect(() => verifyToken(token)).toThrow();
  });
});
