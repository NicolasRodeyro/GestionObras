import { api } from './api';
import type { Anotacion, AnotacionInput, UpdateAnotacionInput } from '../types/anotacion';

export async function fetchAnotaciones(obraId: string): Promise<Anotacion[]> {
  const { data } = await api.get<{ anotaciones: Anotacion[] }>(`/obras/${obraId}/anotaciones`);
  return data.anotaciones;
}

export async function createAnotacion(obraId: string, input: AnotacionInput): Promise<Anotacion> {
  const { data } = await api.post<{ anotacion: Anotacion }>(`/obras/${obraId}/anotaciones`, input);
  return data.anotacion;
}

export async function updateAnotacion(id: string, input: UpdateAnotacionInput): Promise<Anotacion> {
  const { data } = await api.put<{ anotacion: Anotacion }>(`/anotaciones/${id}`, input);
  return data.anotacion;
}

export async function deleteAnotacion(id: string): Promise<void> {
  await api.delete(`/anotaciones/${id}`);
}
