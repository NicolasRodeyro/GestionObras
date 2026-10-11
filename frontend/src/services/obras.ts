import { api } from './api';
import type { Obra, ObraInput } from '../types/obra';

export async function fetchObras(): Promise<Obra[]> {
  const { data } = await api.get<{ obras: Obra[] }>('/obras');
  return data.obras;
}

export async function fetchObra(id: string): Promise<Obra> {
  const { data } = await api.get<{ obra: Obra }>(`/obras/${id}`);
  return data.obra;
}

export async function createObra(input: ObraInput): Promise<Obra> {
  const { data } = await api.post<{ obra: Obra }>('/obras', input);
  return data.obra;
}

export async function updateObra(id: string, input: Partial<ObraInput>): Promise<Obra> {
  const { data } = await api.put<{ obra: Obra }>(`/obras/${id}`, input);
  return data.obra;
}

export async function deleteObra(id: string): Promise<void> {
  await api.delete(`/obras/${id}`);
}
