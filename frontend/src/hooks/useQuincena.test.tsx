import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as quincenasService from '../services/quincenas';
import { useMarcarComoPagada, useQuincena } from './useQuincena';
import type { Quincena } from '../types/quincena';

vi.mock('../services/quincenas');

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

beforeEach(() => {
  vi.clearAllMocks();
});

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useQuincena', () => {
  it('loads the quincena for an empleado and period', async () => {
    vi.mocked(quincenasService.fetchQuincena).mockResolvedValueOnce(sampleQuincena);

    const { result } = renderHook(() => useQuincena('e1', 8, 2026), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(quincenasService.fetchQuincena).toHaveBeenCalledWith('e1', 8, 2026);
    expect(result.current.data).toEqual(sampleQuincena);
  });

  it('does not fetch when there is no empleadoId', () => {
    renderHook(() => useQuincena('', 8, 2026), { wrapper });

    expect(quincenasService.fetchQuincena).not.toHaveBeenCalled();
  });
});

describe('useMarcarComoPagada', () => {
  it('marks the quincena as pagada', async () => {
    vi.mocked(quincenasService.marcarComoPagada).mockResolvedValueOnce({ ...sampleQuincena, estado: 'pagada' });

    const { result } = renderHook(() => useMarcarComoPagada(), { wrapper });
    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(quincenasService.marcarComoPagada).toHaveBeenCalledWith('1');
  });
});
