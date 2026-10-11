import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as useObrasHooks from '../hooks/useObras';
import * as useGastosHooks from '../hooks/useGastos';
import { Gastos } from './Gastos';
import type { Obra } from '../types/obra';
import type { Gasto } from '../types/gasto';

vi.mock('../hooks/useObras');
vi.mock('../hooks/useGastos');

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

const gastos: Gasto[] = [
  {
    id: 'g1',
    obraId: 'o1',
    monto: 500,
    categoria: 'materiales',
    detalle: 'Cemento',
    fecha: '2026-06-01T00:00:00.000Z',
    userId: 'u1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
];

const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();
const mutateDelete = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useObrasHooks.useObras).mockReturnValue({
    data: obras,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useObrasHooks.useObras>);
  vi.mocked(useGastosHooks.useGastos).mockReturnValue({
    data: { gastos, total: 500 },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useGastosHooks.useGastos>);
  vi.mocked(useGastosHooks.useResumenGastos).mockReturnValue({
    data: { materiales: 500 },
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useGastosHooks.useResumenGastos>);
  vi.mocked(useGastosHooks.useCreateGasto).mockReturnValue({
    mutate: mutateCreate,
    isPending: false,
  } as unknown as ReturnType<typeof useGastosHooks.useCreateGasto>);
  vi.mocked(useGastosHooks.useUpdateGasto).mockReturnValue({
    mutate: mutateUpdate,
    isPending: false,
  } as unknown as ReturnType<typeof useGastosHooks.useUpdateGasto>);
  vi.mocked(useGastosHooks.useDeleteGasto).mockReturnValue({
    mutate: mutateDelete,
    isPending: false,
  } as unknown as ReturnType<typeof useGastosHooks.useDeleteGasto>);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Gastos />
    </MemoryRouter>,
  );
}

describe('Gastos page', () => {
  it('lists gastos with the obra name and the total', () => {
    renderPage();

    const row = screen.getByText('Cemento').closest('tr')!;
    expect(within(row).getByText('Edificio Central')).toBeInTheDocument();
    expect(within(row).getByText(/500/)).toBeInTheDocument();
  });

  it('refetches with the obraId filter when an obra is selected', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText(/filtrar por obra/i), 'o1');

    await waitFor(() =>
      expect(useGastosHooks.useGastos).toHaveBeenLastCalledWith(expect.objectContaining({ obraId: 'o1' })),
    );
  });

  it('opens the create form and submits a new gasto', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nuevo gasto/i }));
    await user.selectOptions(screen.getByLabelText(/^obra$/i), 'o1');
    await user.type(screen.getByLabelText(/monto/i), '150');
    await user.type(screen.getByLabelText(/fecha/i), '2026-06-20');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateCreate).toHaveBeenCalledWith(
        expect.objectContaining({ obraId: 'o1', monto: 150 }),
        expect.anything(),
      ),
    );
  });

  it('deletes a gasto after confirming', async () => {
    const user = userEvent.setup();
    renderPage();

    const row = screen.getByText('Cemento').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: /eliminar/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(mutateDelete).toHaveBeenCalledWith('g1', expect.anything());
  });
});
