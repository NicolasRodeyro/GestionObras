import { api } from './api';
import type { Empleado, EmpleadoInput, HoraTrabajada, HorasInput, HorasResumen } from '../types/empleado';

export async function fetchEmpleados(): Promise<Empleado[]> {
  const { data } = await api.get<{ empleados: Empleado[] }>('/empleados');
  return data.empleados;
}

export async function createEmpleado(input: EmpleadoInput): Promise<Empleado> {
  const { data } = await api.post<{ empleado: Empleado }>('/empleados', input);
  return data.empleado;
}

export async function updateEmpleado(id: string, input: Partial<EmpleadoInput>): Promise<Empleado> {
  const { data } = await api.put<{ empleado: Empleado }>(`/empleados/${id}`, input);
  return data.empleado;
}

export async function fetchHoras(empleadoId: string, mes: number, anio: number): Promise<HorasResumen> {
  const { data } = await api.get<HorasResumen>(`/empleados/${empleadoId}/horas`, { params: { mes, anio } });
  return data;
}

export async function registrarHoras(empleadoId: string, input: HorasInput): Promise<HoraTrabajada> {
  const { data } = await api.post<{ registro: HoraTrabajada }>(`/empleados/${empleadoId}/horas`, input);
  return data.registro;
}
