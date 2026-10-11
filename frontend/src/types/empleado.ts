export type EstadoEmpleado = 'activo' | 'inactivo';

export interface Empleado {
  id: string;
  nombre: string;
  email: string | null;
  dni: string | null;
  tarifaPorHora: number;
  estado: EstadoEmpleado;
  createdAt: string;
  updatedAt: string;
}

export interface EmpleadoInput {
  nombre: string;
  email?: string;
  dni?: string;
  tarifaPorHora: number;
  estado?: EstadoEmpleado;
}

export interface HoraTrabajada {
  id: string;
  empleadoId: string;
  obraId: string;
  fecha: string;
  horas: number;
  detalle: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HorasInput {
  obraId: string;
  fecha: string;
  horas: number;
  detalle?: string;
}

export interface HorasResumen {
  horasDetalle: HoraTrabajada[];
  totalHoras: number;
  sueldoEstimado: number;
}
