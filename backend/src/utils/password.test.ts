import { describe, expect, it } from "vitest";
import { hashPassword, comparePassword } from "./password";

describe("password utils", () => {
  it("hashes a password to a different string", async () => {
    const hash = await hashPassword("supersecret123");

    expect(hash).not.toBe("supersecret123");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("returns true when comparing the correct password", async () => {
    const hash = await hashPassword("supersecret123");

    await expect(comparePassword("supersecret123", hash)).resolves.toBe(true);
  });

  it("returns false when comparing an incorrect password", async () => {
    const hash = await hashPassword("supersecret123");

    await expect(comparePassword("wrongpassword", hash)).resolves.toBe(false);
  });
});
