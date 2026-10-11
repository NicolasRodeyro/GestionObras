import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { fetchQuincena, marcarComoPagada } from './quincenas';
import type { Quincena } from '../types/quincena';

vi.mock('./api', () => ({
  api: { get: vi.fn(), put: vi.fn() },
}));

const sampleQuincena: Quincena = {
  id: '1',
  empleadoId: 'e1',
  fechaInicio: '2026-08-01T00:00:00.000Z',
  fechaFin: '2026-08-31T00:00:00.000Z',
  horasTotales: 160,
  tarifaPorHora: 250,
  sueldoBruto: 40000,
  sueldoNeto: 40000,
  estado: 'calculada',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

describe('quincenas service', () => {
  it('fetchQuincena calculates the quincena for the given period', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { quincena: sampleQuincena } });

    const result = await fetchQuincena('e1', 8, 2026);

    expect(api.get).toHaveBeenCalledWith('/quincenas/e1', { params: { mes: 8, anio: 2026 } });
    expect(result).toEqual(sampleQuincena);
  });

  it('marcarComoPagada puts the estado pagada', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { quincena: { ...sampleQuincena, estado: 'pagada' } } });

    const result = await marcarComoPagada('1');

    expect(api.put).toHaveBeenCalledWith('/quincenas/1/pagar');
    expect(result.estado).toBe('pagada');
  });
});
