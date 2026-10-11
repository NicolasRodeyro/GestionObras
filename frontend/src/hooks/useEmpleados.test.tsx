import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import * as empleadosService from '../services/empleados';
import {
  useCreateEmpleado,
  useEmpleados,
  useHoras,
  useRegistrarHoras,
  useUpdateEmpleado,
} from './useEmpleados';
import type { Empleado, HorasResumen } from '../types/empleado';

vi.mock('../services/empleados');

const sampleEmpleado: Empleado = {
  id: '1',
  nombre: 'Juan Perez',
  email: null,
  dni: null,
  tarifaPorHora: 250,
  estado: 'activo',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useEmpleados', () => {
  it('loads the list of empleados', async () => {
    vi.mocked(empleadosService.fetchEmpleados).mockResolvedValueOnce([sampleEmpleado]);

    const { result } = renderHook(() => useEmpleados(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([sampleEmpleado]);
  });
});

describe('useCreateEmpleado', () => {
  it('creates an empleado', async () => {
    vi.mocked(empleadosService.createEmpleado).mockResolvedValueOnce(sampleEmpleado);

    const { result } = renderHook(() => useCreateEmpleado(), { wrapper });
    result.current.mutate({ nombre: 'Juan Perez', tarifaPorHora: 250 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUpdateEmpleado', () => {
  it('updates an empleado', async () => {
    vi.mocked(empleadosService.updateEmpleado).mockResolvedValueOnce(sampleEmpleado);

    const { result } = renderHook(() => useUpdateEmpleado(), { wrapper });
    result.current.mutate({ id: '1', input: { tarifaPorHora: 300 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(empleadosService.updateEmpleado).toHaveBeenCalledWith('1', { tarifaPorHora: 300 });
  });
});

describe('useHoras', () => {
  it('loads the monthly resumen for an empleado', async () => {
    const resumen: HorasResumen = { horasDetalle: [], totalHoras: 160, sueldoEstimado: 40000 };
    vi.mocked(empleadosService.fetchHoras).mockResolvedValueOnce(resumen);

    const { result } = renderHook(() => useHoras('1', 8, 2026), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(empleadosService.fetchHoras).toHaveBeenCalledWith('1', 8, 2026);
    expect(result.current.data).toEqual(resumen);
  });
});

describe('useRegistrarHoras', () => {
  it('registers hours for an empleado', async () => {
    vi.mocked(empleadosService.registrarHoras).mockResolvedValueOnce({
      id: 'h1',
      empleadoId: '1',
      obraId: 'o1',
      fecha: '2026-08-03T00:00:00.000Z',
      horas: 8,
      detalle: null,
      userId: 'u1',
      createdAt: '2026-08-03T00:00:00.000Z',
      updatedAt: '2026-08-03T00:00:00.000Z',
    });

    const { result } = renderHook(() => useRegistrarHoras(), { wrapper });
    result.current.mutate({ empleadoId: '1', input: { obraId: 'o1', fecha: '2026-08-03', horas: 8 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(empleadosService.registrarHoras).toHaveBeenCalledWith('1', { obraId: 'o1', fecha: '2026-08-03', horas: 8 });
  });
});
