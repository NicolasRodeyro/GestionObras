import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { createGasto, deleteGasto, fetchGastos, fetchResumen, updateGasto } from './gastos';
import type { Gasto } from '../types/gasto';

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const sampleGasto: Gasto = {
  id: '1',
  obraId: 'o1',
  monto: 500,
  categoria: 'materiales',
  detalle: null,
  fecha: '2026-06-01T00:00:00.000Z',
  userId: 'u1',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('gastos service', () => {
  it('fetchGastos lists gastos with total, passing filters as query params', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { gastos: [sampleGasto], total: 500 } });

    const result = await fetchGastos({ obraId: 'o1', categoria: 'materiales' });

    expect(api.get).toHaveBeenCalledWith('/gastos', { params: { obraId: 'o1', categoria: 'materiales' } });
    expect(result).toEqual({ gastos: [sampleGasto], total: 500 });
  });

  it('fetchResumen gets totals by categoria', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { porCategoria: { materiales: 500 } } });

    const result = await fetchResumen({ obraId: 'o1' });

    expect(api.get).toHaveBeenCalledWith('/gastos/resumen', { params: { obraId: 'o1' } });
    expect(result).toEqual({ materiales: 500 });
  });

  it('createGasto posts the new gasto', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { gasto: sampleGasto } });

    const result = await createGasto({ obraId: 'o1', monto: 500, categoria: 'materiales', fecha: '2026-06-01' });

    expect(api.post).toHaveBeenCalledWith('/gastos', {
      obraId: 'o1',
      monto: 500,
      categoria: 'materiales',
      fecha: '2026-06-01',
    });
    expect(result).toEqual(sampleGasto);
  });

  it('updateGasto puts the changed fields', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { gasto: sampleGasto } });

    const result = await updateGasto('1', { monto: 600 });

    expect(api.put).toHaveBeenCalledWith('/gastos/1', { monto: 600 });
    expect(result).toEqual(sampleGasto);
  });

  it('deleteGasto deletes by id', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({});

    await deleteGasto('1');

    expect(api.delete).toHaveBeenCalledWith('/gastos/1');
  });
});
