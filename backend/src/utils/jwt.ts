import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/auth";

const DEFAULT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = "15d";

function requireSecret(secret?: string): string {
  const resolved = secret ?? DEFAULT_SECRET;
  if (!resolved) {
    throw new Error("JWT_SECRET is not configured");
  }
  return resolved;
}

export function generateToken(payload: TokenPayload, secret?: string): string {
  return jwt.sign(payload, requireSecret(secret), { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string, secret?: string): TokenPayload {
  return jwt.verify(token, requireSecret(secret)) as TokenPayload;
}
