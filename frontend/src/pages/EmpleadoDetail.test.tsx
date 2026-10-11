import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as useEmpleadosHooks from '../hooks/useEmpleados';
import * as useObrasHooks from '../hooks/useObras';
import { EmpleadoDetail } from './EmpleadoDetail';
import type { Empleado, HorasResumen } from '../types/empleado';
import type { Obra } from '../types/obra';

vi.mock('../hooks/useEmpleados');
vi.mock('../hooks/useObras');

const empleado: Empleado = {
  id: '1',
  nombre: 'Juan Perez',
  email: null,
  dni: null,
  tarifaPorHora: 250,
  estado: 'activo',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const obras: Obra[] = [
  {
    id: 'o1',
    nombre: 'Edificio Central',
    descripcion: null,
    fechaInicio: null,
    fechaFin: null,
    estado: 'planificada',
    presupuesto: 1000,
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const resumen: HorasResumen = {
  horasDetalle: [
    {
      id: 'h1',
      empleadoId: '1',
      obraId: 'o1',
      fecha: '2026-08-03T00:00:00.000Z',
      horas: 8,
      detalle: null,
      userId: 'u1',
      createdAt: '2026-08-03T00:00:00.000Z',
      updatedAt: '2026-08-03T00:00:00.000Z',
    },
  ],
  totalHoras: 160,
  sueldoEstimado: 40000,
};

const mutateRegistrar = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useEmpleadosHooks.useEmpleados).mockReturnValue({
    data: [empleado],
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useEmpleadosHooks.useEmpleados>);
  vi.mocked(useEmpleadosHooks.useHoras).mockReturnValue({
    data: resumen,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useEmpleadosHooks.useHoras>);
  vi.mocked(useEmpleadosHooks.useRegistrarHoras).mockReturnValue({
    mutate: mutateRegistrar,
    isPending: false,
  } as unknown as ReturnType<typeof useEmpleadosHooks.useRegistrarHoras>);
  vi.mocked(useObrasHooks.useObras).mockReturnValue({
    data: obras,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useObrasHooks.useObras>);
});

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/empleados/${id}`]}>
      <Routes>
        <Route path="/empleados/:id" element={<EmpleadoDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EmpleadoDetail page', () => {
  it('shows total hours and sueldo estimado', () => {
    renderAt('1');

    expect(screen.getByRole('heading', { name: 'Juan Perez' })).toBeInTheDocument();
    expect(screen.getByText(/160/)).toBeInTheDocument();
    expect(screen.getByText(/40.000|40000|40,000/)).toBeInTheDocument();
  });

  it('opens the form and registers new hours', async () => {
    const user = userEvent.setup();
    renderAt('1');

    await user.click(screen.getByRole('button', { name: /registrar horas/i }));
    await user.selectOptions(screen.getByLabelText(/obra/i), 'o1');
    await user.type(screen.getByLabelText(/fecha/i), '2026-08-10');
    await user.type(screen.getByLabelText(/horas/i), '4');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateRegistrar).toHaveBeenCalledWith(
        expect.objectContaining({
          empleadoId: '1',
          input: expect.objectContaining({ obraId: 'o1', fecha: '2026-08-10', horas: 4 }),
        }),
        expect.anything(),
      ),
    );
  });
});
