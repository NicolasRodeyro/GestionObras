import { prisma } from "../utils/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import type { Rol } from "../types/auth";

export class AuthError extends Error {}

export interface PublicUser {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

interface RegisterInput {
  email: string;
  password: string;
  nombre: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function toPublicUser(user: { id: string; email: string; nombre: string; rol: string }): PublicUser {
  return { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol as Rol };
}

export async function registerUser(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("El email ya está registrado");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, nombre: input.nombre },
  });

  const token = generateToken({ userId: user.id, rol: user.rol as Rol });
  return { user: toPublicUser(user), token };
}

export async function loginUser(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthError("Credenciales inválidas");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Credenciales inválidas");
  }

  const token = generateToken({ userId: user.id, rol: user.rol as Rol });
  return { user: toPublicUser(user), token };
}
