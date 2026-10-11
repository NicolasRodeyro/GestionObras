import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HorasForm } from './HorasForm';
import type { Obra } from '../../../types/obra';

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

describe('HorasForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HorasForm obras={obras} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findAllByText(/requerid/i)).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered hours', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HorasForm obras={obras} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText(/obra/i), 'o1');
    await user.type(screen.getByLabelText(/fecha/i), '2026-08-03');
    await user.type(screen.getByLabelText(/horas/i), '8');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ obraId: 'o1', fecha: '2026-08-03', horas: 8 }),
    );
  });
});
