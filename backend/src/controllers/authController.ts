import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "../routes/auth.schemas";
import { registerUser, loginUser, AuthError } from "../services/authService";
import { prisma } from "../utils/prisma";

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const { user, token } = await registerUser(parsed.data);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(409).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    return;
  }

  try {
    const { user, token } = await loginUser(parsed.data);
    res.status(200).json({ user, token });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  const payload = req.user!;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  res.status(200).json({
    user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
  });
}
