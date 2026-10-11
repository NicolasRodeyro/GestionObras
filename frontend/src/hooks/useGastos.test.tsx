import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as gastosService from '../services/gastos';
import { useCreateGasto, useDeleteGasto, useGastos, useResumenGastos, useUpdateGasto } from './useGastos';
import type { Gasto } from '../types/gasto';

vi.mock('../services/gastos');

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

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useGastos', () => {
  it('loads gastos with the given filters', async () => {
    vi.mocked(gastosService.fetchGastos).mockResolvedValueOnce({ gastos: [sampleGasto], total: 500 });

    const { result } = renderHook(() => useGastos({ obraId: 'o1' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(gastosService.fetchGastos).toHaveBeenCalledWith({ obraId: 'o1' });
    expect(result.current.data).toEqual({ gastos: [sampleGasto], total: 500 });
  });
});

describe('useResumenGastos', () => {
  it('loads the resumen por categoria', async () => {
    vi.mocked(gastosService.fetchResumen).mockResolvedValueOnce({ materiales: 500 });

    const { result } = renderHook(() => useResumenGastos({}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ materiales: 500 });
  });
});

describe('useCreateGasto', () => {
  it('creates a gasto', async () => {
    vi.mocked(gastosService.createGasto).mockResolvedValueOnce(sampleGasto);

    const { result } = renderHook(() => useCreateGasto(), { wrapper });
    result.current.mutate({ obraId: 'o1', monto: 500, categoria: 'materiales', fecha: '2026-06-01' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateGasto', () => {
  it('updates a gasto', async () => {
    vi.mocked(gastosService.updateGasto).mockResolvedValueOnce(sampleGasto);

    const { result } = renderHook(() => useUpdateGasto(), { wrapper });
    result.current.mutate({ id: '1', input: { monto: 600 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(gastosService.updateGasto).toHaveBeenCalledWith('1', { monto: 600 });
  });
});

describe('useDeleteGasto', () => {
  it('deletes a gasto', async () => {
    vi.mocked(gastosService.deleteGasto).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteGasto(), { wrapper });
    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
