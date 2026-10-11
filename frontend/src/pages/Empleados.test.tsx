import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as useEmpleadosHooks from '../hooks/useEmpleados';
import { Empleados } from './Empleados';
import type { Empleado } from '../types/empleado';

vi.mock('../hooks/useEmpleados');

const empleados: Empleado[] = [
  {
    id: '1',
    nombre: 'Juan Perez',
    email: null,
    dni: null,
    tarifaPorHora: 250,
    estado: 'activo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useEmpleadosHooks.useEmpleados).mockReturnValue({
    data: empleados,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useEmpleadosHooks.useEmpleados>);
  vi.mocked(useEmpleadosHooks.useCreateEmpleado).mockReturnValue({
    mutate: mutateCreate,
    isPending: false,
  } as unknown as ReturnType<typeof useEmpleadosHooks.useCreateEmpleado>);
  vi.mocked(useEmpleadosHooks.useUpdateEmpleado).mockReturnValue({
    mutate: mutateUpdate,
    isPending: false,
  } as unknown as ReturnType<typeof useEmpleadosHooks.useUpdateEmpleado>);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Empleados />
    </MemoryRouter>,
  );
}

describe('Empleados page', () => {
  it('lists empleados in a table with a link to their detail', () => {
    renderPage();

    const link = screen.getByRole('link', { name: 'Juan Perez' });
    expect(link).toHaveAttribute('href', '/empleados/1');
  });

  it('opens the create form and submits a new empleado', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo empleado/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Ana Gomez');
    await user.type(screen.getByLabelText(/tarifa/i), '300');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateCreate).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Ana Gomez', tarifaPorHora: 300 }),
        expect.anything(),
      ),
    );
  });

  it('opens the edit form pre-filled and submits changes', async () => {
    const user = userEvent.setup();
    renderPage();

    const row = screen.getByText('Juan Perez').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: /editar/i }));

    expect(screen.getByLabelText(/tarifa/i)).toHaveValue(250);

    await user.clear(screen.getByLabelText(/tarifa/i));
    await user.type(screen.getByLabelText(/tarifa/i), '400');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', input: expect.objectContaining({ tarifaPorHora: 400 }) }),
        expect.anything(),
      ),
    );
  });
});
