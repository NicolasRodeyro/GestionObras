import { prisma } from "../utils/prisma";

export async function resetDb(): Promise<void> {
  await prisma.obra.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.user.deleteMany();
}
