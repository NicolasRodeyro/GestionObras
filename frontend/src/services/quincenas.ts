import { api } from './api';
import type { Quincena } from '../types/quincena';

export async function fetchQuincena(empleadoId: string, mes: number, anio: number): Promise<Quincena> {
  const { data } = await api.get<{ quincena: Quincena }>(`/quincenas/${empleadoId}`, { params: { mes, anio } });
  return data.quincena;
}

export async function marcarComoPagada(id: string): Promise<Quincena> {
  const { data } = await api.put<{ quincena: Quincena }>(`/quincenas/${id}/pagar`);
  return data.quincena;
}
