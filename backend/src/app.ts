import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { authRouter } from "./routes/auth";
import { obrasRouter } from "./routes/obras";
import { gastosRouter } from "./routes/gastos";
import { empleadosRouter } from "./routes/empleados";
import { quincenasRouter } from "./routes/quincenas";
import { anotacionesRouter } from "./routes/anotaciones";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/obras", obrasRouter);
app.use("/api/gastos", gastosRouter);
app.use("/api/empleados", empleadosRouter);
app.use("/api/quincenas", quincenasRouter);
app.use("/api/anotaciones", anotacionesRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
