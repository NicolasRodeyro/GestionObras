import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useAnotacionesHooks from '../../../hooks/useAnotaciones';
import { AnotacionesList } from './AnotacionesList';
import type { Anotacion } from '../../../types/anotacion';

vi.mock('../../../hooks/useAnotaciones');

const anotaciones: Anotacion[] = [
  {
    id: '1',
    obraId: 'o1',
    titulo: 'Revisar plano',
    descripcion: null,
    prioridad: 'alta',
    completada: false,
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
  vi.mocked(useAnotacionesHooks.useAnotaciones).mockReturnValue({
    data: anotaciones,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useAnotacionesHooks.useAnotaciones>);
  vi.mocked(useAnotacionesHooks.useCreateAnotacion).mockReturnValue({
    mutate: mutateCreate,
    isPending: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useCreateAnotacion>);
  vi.mocked(useAnotacionesHooks.useUpdateAnotacion).mockReturnValue({
    mutate: mutateUpdate,
    isPending: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useUpdateAnotacion>);
  vi.mocked(useAnotacionesHooks.useDeleteAnotacion).mockReturnValue({
    mutate: mutateDelete,
    isPending: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useDeleteAnotacion>);
});

describe('AnotacionesList', () => {
  it('lists anotaciones with title and prioridad', () => {
    render(<AnotacionesList obraId="o1" />);

    expect(screen.getByText('Revisar plano')).toBeInTheDocument();
    expect(screen.getByText(/alta/i)).toBeInTheDocument();
  });

  it('toggles completada when the checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<AnotacionesList obraId="o1" />);

    const row = screen.getByText('Revisar plano').closest('li')!;
    await user.click(within(row).getByRole('checkbox'));

    expect(mutateUpdate).toHaveBeenCalledWith(
      { id: '1', input: { completada: true } },
      expect.anything(),
    );
  });

  it('opens the form and creates a new anotacion', async () => {
    const user = userEvent.setup();
    render(<AnotacionesList obraId="o1" />);

    await user.click(screen.getByRole('button', { name: /agregar anotación/i }));
    await user.type(screen.getByLabelText(/título/i), 'Pedir materiales');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(mutateCreate).toHaveBeenCalledWith(
        { obraId: 'o1', input: expect.objectContaining({ titulo: 'Pedir materiales' }) },
        expect.anything(),
      ),
    );
  });

  it('deletes an anotacion', async () => {
    const user = userEvent.setup();
    render(<AnotacionesList obraId="o1" />);

    const row = screen.getByText('Revisar plano').closest('li')!;
    await user.click(within(row).getByRole('button', { name: /eliminar/i }));

    expect(mutateDelete).toHaveBeenCalledWith('1', expect.anything());
  });
});
