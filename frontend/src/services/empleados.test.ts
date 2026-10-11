import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import {
  createEmpleado,
  fetchEmpleados,
  fetchHoras,
  registrarHoras,
  updateEmpleado,
} from './empleados';
import type { Empleado, HorasResumen } from '../types/empleado';

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

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

describe('empleados service', () => {
  it('fetchEmpleados lists all empleados', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { empleados: [sampleEmpleado] } });

    const result = await fetchEmpleados();

    expect(api.get).toHaveBeenCalledWith('/empleados');
    expect(result).toEqual([sampleEmpleado]);
  });

  it('createEmpleado posts the new empleado', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { empleado: sampleEmpleado } });

    const result = await createEmpleado({ nombre: 'Juan Perez', tarifaPorHora: 250 });

    expect(api.post).toHaveBeenCalledWith('/empleados', { nombre: 'Juan Perez', tarifaPorHora: 250 });
    expect(result).toEqual(sampleEmpleado);
  });

  it('updateEmpleado puts the changed fields', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: { empleado: sampleEmpleado } });

    const result = await updateEmpleado('1', { tarifaPorHora: 300 });

    expect(api.put).toHaveBeenCalledWith('/empleados/1', { tarifaPorHora: 300 });
    expect(result).toEqual(sampleEmpleado);
  });

  it('fetchHoras gets the monthly resumen', async () => {
    const resumen: HorasResumen = { horasDetalle: [], totalHoras: 160, sueldoEstimado: 40000 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: resumen });

    const result = await fetchHoras('1', 8, 2026);

    expect(api.get).toHaveBeenCalledWith('/empleados/1/horas', { params: { mes: 8, anio: 2026 } });
    expect(result).toEqual(resumen);
  });

  it('registrarHoras posts the new registro', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { registro: { id: 'h1' } } });

    const result = await registrarHoras('1', { obraId: 'o1', fecha: '2026-08-03', horas: 8 });

    expect(api.post).toHaveBeenCalledWith('/empleados/1/horas', { obraId: 'o1', fecha: '2026-08-03', horas: 8 });
    expect(result).toEqual({ id: 'h1' });
  });
});
