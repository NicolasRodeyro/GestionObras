import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { createAnotacion, deleteAnotacion, fetchAnotaciones, updateAnotacion } from './anotaciones';
import type { Anotacion } from '../types/anotacion';

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const sampleAnotacion: Anotacion = {
  id: '1',
  obraId: 'o1',
  titulo: 'Revisar plano',
  descripcion: null,
  prioridad: 'media',
  completada: false,
  userId: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('anotaciones service', () => {
  it('fetchAnotaciones lists anotaciones for an obra', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { anotaciones: [sampleAnotacion] } });

    const result = await fetchAnotaciones('o1');

    expect(api.get).toHaveBeenCalledWith('/obras/o1/anotaciones');
    expect(result).toEqual([sampleAnotacion]);
  });

  it('createAnotacion posts the new anotacion for an obra', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { anotacion: sampleAnotacion } });

    const result = await createAnotacion('o1', { titulo: 'Revisar plano' });

    expect(api.post).toHaveBeenCalledWith('/obras/o1/anotaciones', { titulo: 'Revisar plano' });
    expect(result).toEqual(sampleAnotacion);
  });

  it('updateAnotacion puts the changed fields', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { anotacion: { ...sampleAnotacion, completada: true } } });

    const result = await updateAnotacion('1', { completada: true });

    expect(api.put).toHaveBeenCalledWith('/anotaciones/1', { completada: true });
    expect(result.completada).toBe(true);
  });

  it('deleteAnotacion deletes by id', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({});

    await deleteAnotacion('1');

    expect(api.delete).toHaveBeenCalledWith('/anotaciones/1');
  });
});
