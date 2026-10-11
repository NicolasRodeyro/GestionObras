import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { authenticateToken } from "./auth";
import { generateToken } from "../utils/jwt";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("authenticateToken middleware", () => {
  it("calls next() and attaches user when the token is valid", () => {
    const token = generateToken({ userId: "user-1", rol: "admin" });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user).toMatchObject({ userId: "user-1", rol: "admin" });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no authorization header", () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when the token is invalid", () => {
    const req = { headers: { authorization: "Bearer not-a-real-token" } } as Request;
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
