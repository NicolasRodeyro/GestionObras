import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as useEmpleadosHooks from '../hooks/useEmpleados';
import * as useQuincenaHooks from '../hooks/useQuincena';
import { Quincena } from './Quincena';
import type { Empleado } from '../types/empleado';
import type { Quincena as QuincenaType } from '../types/quincena';

vi.mock('../hooks/useEmpleados');
vi.mock('../hooks/useQuincena');

const empleados: Empleado[] = [
  {
    id: 'e1',
    nombre: 'Juan Perez',
    email: null,
    dni: null,
    tarifaPorHora: 250,
    estado: 'activo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const quincenaCalculada: QuincenaType = {
  id: 'q1',
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

const mutatePagar = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useEmpleadosHooks.useEmpleados).mockReturnValue({
    data: empleados,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useEmpleadosHooks.useEmpleados>);
  vi.mocked(useQuincenaHooks.useQuincena).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useQuincenaHooks.useQuincena>);
  vi.mocked(useQuincenaHooks.useMarcarComoPagada).mockReturnValue({
    mutate: mutatePagar,
    isPending: false,
  } as unknown as ReturnType<typeof useQuincenaHooks.useMarcarComoPagada>);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Quincena />
    </MemoryRouter>,
  );
}

describe('Quincena page', () => {
  it('shows a prompt to select an empleado before calculating anything', () => {
    renderPage();

    expect(screen.getByText('Seleccioná un empleado para calcular su quincena')).toBeInTheDocument();
  });

  it('shows horas, tarifa, sueldo bruto y neto once an empleado and period are selected', async () => {
    const user = userEvent.setup();
    vi.mocked(useQuincenaHooks.useQuincena).mockReturnValue({
      data: quincenaCalculada,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuincenaHooks.useQuincena>);

    renderPage();

    await user.selectOptions(screen.getByLabelText(/empleado/i), 'e1');

    expect(screen.getByText('160')).toBeInTheDocument();
    expect(screen.getAllByText(/40.000|40000|40,000/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /marcar como pagad/i })).toBeInTheDocument();
  });

  it('marks the quincena as pagada', async () => {
    const user = userEvent.setup();
    vi.mocked(useQuincenaHooks.useQuincena).mockReturnValue({
      data: quincenaCalculada,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuincenaHooks.useQuincena>);

    renderPage();
    await user.selectOptions(screen.getByLabelText(/empleado/i), 'e1');
    await user.click(screen.getByRole('button', { name: /marcar como pagad/i }));

    await waitFor(() => expect(mutatePagar).toHaveBeenCalledWith('q1'));
  });

  it('hides the pagar button when the quincena is already pagada', async () => {
    const user = userEvent.setup();
    vi.mocked(useQuincenaHooks.useQuincena).mockReturnValue({
      data: { ...quincenaCalculada, estado: 'pagada' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useQuincenaHooks.useQuincena>);

    renderPage();
    await user.selectOptions(screen.getByLabelText(/empleado/i), 'e1');

    expect(screen.queryByRole('button', { name: /marcar como pagad/i })).not.toBeInTheDocument();
    expect(screen.getByText(/pagada/i)).toBeInTheDocument();
  });
});
