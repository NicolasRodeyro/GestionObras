import { api } from './api';
import type { Gasto, GastoFilters, GastoInput } from '../types/gasto';

export async function fetchGastos(filters: GastoFilters = {}): Promise<{ gastos: Gasto[]; total: number }> {
  const { data } = await api.get<{ gastos: Gasto[]; total: number }>('/gastos', { params: filters });
  return data;
}

export async function fetchResumen(filters: Omit<GastoFilters, 'categoria'> = {}): Promise<Record<string, number>> {
  const { data } = await api.get<{ porCategoria: Record<string, number> }>('/gastos/resumen', { params: filters });
  return data.porCategoria;
}

export async function createGasto(input: GastoInput): Promise<Gasto> {
  const { data } = await api.post<{ gasto: Gasto }>('/gastos', input);
  return data.gasto;
}

export async function updateGasto(id: string, input: Partial<GastoInput>): Promise<Gasto> {
  const { data } = await api.put<{ gasto: Gasto }>(`/gastos/${id}`, input);
  return data.gasto;
}

export async function deleteGasto(id: string): Promise<void> {
  await api.delete(`/gastos/${id}`);
}
