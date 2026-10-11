import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as anotacionesService from '../services/anotaciones';
import {
  useAnotaciones,
  useCreateAnotacion,
  useDeleteAnotacion,
  useUpdateAnotacion,
} from './useAnotaciones';
import type { Anotacion } from '../types/anotacion';

vi.mock('../services/anotaciones');

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

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useAnotaciones', () => {
  it('loads the anotaciones for an obra', async () => {
    vi.mocked(anotacionesService.fetchAnotaciones).mockResolvedValueOnce([sampleAnotacion]);

    const { result } = renderHook(() => useAnotaciones('o1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(anotacionesService.fetchAnotaciones).toHaveBeenCalledWith('o1');
    expect(result.current.data).toEqual([sampleAnotacion]);
  });
});

describe('useCreateAnotacion', () => {
  it('creates an anotacion for an obra', async () => {
    vi.mocked(anotacionesService.createAnotacion).mockResolvedValueOnce(sampleAnotacion);

    const { result } = renderHook(() => useCreateAnotacion(), { wrapper });
    result.current.mutate({ obraId: 'o1', input: { titulo: 'Revisar plano' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(anotacionesService.createAnotacion).toHaveBeenCalledWith('o1', { titulo: 'Revisar plano' });
  });
});

describe('useUpdateAnotacion', () => {
  it('updates an anotacion', async () => {
    vi.mocked(anotacionesService.updateAnotacion).mockResolvedValueOnce({ ...sampleAnotacion, completada: true });

    const { result } = renderHook(() => useUpdateAnotacion(), { wrapper });
    result.current.mutate({ id: '1', input: { completada: true } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(anotacionesService.updateAnotacion).toHaveBeenCalledWith('1', { completada: true });
  });
});

describe('useDeleteAnotacion', () => {
  it('deletes an anotacion', async () => {
    vi.mocked(anotacionesService.deleteAnotacion).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteAnotacion(), { wrapper });
    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
