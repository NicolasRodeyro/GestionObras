import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { createObra, deleteObra, fetchObra, fetchObras, updateObra } from './obras';
import type { Obra } from '../types/obra';

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const sampleObra: Obra = {
  id: '1',
  nombre: 'Edificio Central',
  descripcion: null,
  fechaInicio: null,
  fechaFin: null,
  estado: 'planificada',
  presupuesto: 1000,
  userId: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('obras service', () => {
  it('fetchObras lists all obras', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { obras: [sampleObra] } });

    const result = await fetchObras();

    expect(api.get).toHaveBeenCalledWith('/obras');
    expect(result).toEqual([sampleObra]);
  });

  it('fetchObra gets a single obra', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { obra: sampleObra } });

    const result = await fetchObra('1');

    expect(api.get).toHaveBeenCalledWith('/obras/1');
    expect(result).toEqual(sampleObra);
  });

  it('createObra posts the new obra', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { obra: sampleObra } });

    const result = await createObra({ nombre: 'Edificio Central', presupuesto: 1000 });

    expect(api.post).toHaveBeenCalledWith('/obras', { nombre: 'Edificio Central', presupuesto: 1000 });
    expect(result).toEqual(sampleObra);
  });

  it('updateObra puts the changed fields', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { obra: sampleObra } });

    const result = await updateObra('1', { nombre: 'Nuevo nombre' });

    expect(api.put).toHaveBeenCalledWith('/obras/1', { nombre: 'Nuevo nombre' });
    expect(result).toEqual(sampleObra);
  });

  it('deleteObra deletes by id', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({});

    await deleteObra('1');

    expect(api.delete).toHaveBeenCalledWith('/obras/1');
  });
});
