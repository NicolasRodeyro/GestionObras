import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/utils/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TEST_USER = {
  email: "admin@obra.com",
  password: "admin12345",
  nombre: "Administrador",
  rol: "admin" as const,
};

async function main() {
  const passwordHash = await hashPassword(TEST_USER.password);

  const user = await prisma.user.upsert({
    where: { email: TEST_USER.email },
    update: {},
    create: {
      email: TEST_USER.email,
      passwordHash,
      nombre: TEST_USER.nombre,
      rol: TEST_USER.rol,
    },
  });

  console.log(`Usuario de prueba listo: ${user.email} (password: ${TEST_USER.password})`);

  const obraA = await prisma.obra.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      nombre: "Edificio Central",
      descripcion: "Construcción de edificio de 8 pisos en el centro",
      fechaInicio: new Date("2026-06-01"),
      estado: "en_progreso",
      presupuesto: "5000000",
      userId: user.id,
    },
  });

  const obraB = await prisma.obra.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      nombre: "Casa Los Álamos",
      descripcion: "Vivienda unifamiliar de dos plantas",
      fechaInicio: new Date("2026-07-15"),
      estado: "planificada",
      presupuesto: "850000",
      userId: user.id,
    },
  });

  await prisma.gasto.createMany({
    data: [
      { obraId: obraA.id, monto: "120000", categoria: "materiales", detalle: "Cemento y ladrillos", fecha: new Date("2026-06-05"), userId: user.id },
      { obraId: obraA.id, monto: "80000", categoria: "mano_obra", detalle: "Cuadrilla junio", fecha: new Date("2026-06-30"), userId: user.id },
      { obraId: obraB.id, monto: "15000", categoria: "servicios", detalle: "Estudio de suelo", fecha: new Date("2026-07-16"), userId: user.id },
    ],
    skipDuplicates: true,
  });

  console.log(`Obras de prueba listas: ${obraA.nombre}, ${obraB.nombre}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
