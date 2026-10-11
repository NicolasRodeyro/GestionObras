import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as obrasService from '../services/obras';
import { useCreateObra, useDeleteObra, useObras, useUpdateObra } from './useObras';
import type { Obra } from '../types/obra';

vi.mock('../services/obras');

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

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useObras', () => {
  it('loads the list of obras', async () => {
    vi.mocked(obrasService.fetchObras).mockResolvedValueOnce([sampleObra]);

    const { result } = renderHook(() => useObras(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([sampleObra]);
  });
});

describe('useCreateObra', () => {
  it('creates an obra', async () => {
    vi.mocked(obrasService.createObra).mockResolvedValueOnce(sampleObra);

    const { result } = renderHook(() => useCreateObra(), { wrapper });
    result.current.mutate({ nombre: 'Edificio Central', presupuesto: 1000 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(obrasService.createObra).toHaveBeenCalledWith({ nombre: 'Edificio Central', presupuesto: 1000 });
  });
});

describe('useUpdateObra', () => {
  it('updates an obra', async () => {
    vi.mocked(obrasService.updateObra).mockResolvedValueOnce(sampleObra);

    const { result } = renderHook(() => useUpdateObra(), { wrapper });
    result.current.mutate({ id: '1', input: { nombre: 'Nuevo' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(obrasService.updateObra).toHaveBeenCalledWith('1', { nombre: 'Nuevo' });
  });
});

describe('useDeleteObra', () => {
  it('deletes an obra', async () => {
    vi.mocked(obrasService.deleteObra).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteObra(), { wrapper });
    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(obrasService.deleteObra).toHaveBeenCalledWith('1');
  });
});
