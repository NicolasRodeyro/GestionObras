import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as useObrasHooks from '../hooks/useObras';
import { Obras } from './Obras';
import type { Obra } from '../types/obra';

vi.mock('../hooks/useObras');

const sampleObras: Obra[] = [
  {
    id: '1',
    nombre: 'Edificio Central',
    descripcion: null,
    fechaInicio: null,
    fechaFin: null,
    estado: 'en_progreso',
    presupuesto: 5000,
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();
const mutateDelete = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useObrasHooks.useObras).mockReturnValue({
    data: sampleObras,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useObrasHooks.useObras>);
  vi.mocked(useObrasHooks.useCreateObra).mockReturnValue({
    mutate: mutateCreate,
    isPending: false,
  } as unknown as ReturnType<typeof useObrasHooks.useCreateObra>);
  vi.mocked(useObrasHooks.useUpdateObra).mockReturnValue({
    mutate: mutateUpdate,
    isPending: false,
  } as unknown as ReturnType<typeof useObrasHooks.useUpdateObra>);
  vi.mocked(useObrasHooks.useDeleteObra).mockReturnValue({
    mutate: mutateDelete,
    isPending: false,
  } as unknown as ReturnType<typeof useObrasHooks.useDeleteObra>);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <Obras />
    </MemoryRouter>,
  );
}

describe('Obras page', () => {
  it('lists the obras in a table', () => {
    renderPage();

    expect(screen.getByText('Edificio Central')).toBeInTheDocument();
  });

  it('opens the create form and submits a new obra', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /nueva obra/i }));
    await user.type(screen.getByLabelText(/nombre/i), 'Casa Sur');
    await user.type(screen.getByLabelText(/presupuesto/i), '3000');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateCreate).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Casa Sur', presupuesto: 3000 }),
        expect.anything(),
      ),
    );
  });

  it('opens the edit form pre-filled and submits changes', async () => {
    const user = userEvent.setup();
    renderPage();

    const row = screen.getByText('Edificio Central').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: /editar/i }));

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Edificio Central');

    await user.clear(screen.getByLabelText(/nombre/i));
    await user.type(screen.getByLabelText(/nombre/i), 'Edificio Central Remodelado');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', input: expect.objectContaining({ nombre: 'Edificio Central Remodelado' }) }),
        expect.anything(),
      ),
    );
  });

  it('deletes an obra after confirming', async () => {
    const user = userEvent.setup();
    renderPage();

    const row = screen.getByText('Edificio Central').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: /eliminar/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(mutateDelete).toHaveBeenCalledWith('1', expect.anything());
  });
});
