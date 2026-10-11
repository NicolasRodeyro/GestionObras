export type Rol = "admin" | "gerente" | "empleado";

export interface TokenPayload {
  userId: string;
  rol: Rol;
}
