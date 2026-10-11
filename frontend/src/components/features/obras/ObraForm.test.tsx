import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObraForm } from './ObraForm';
import type { Obra } from '../../../types/obra';

const sampleObra: Obra = {
  id: '1',
  nombre: 'Edificio Central',
  descripcion: 'Descripción existente',
  fechaInicio: null,
  fechaFin: null,
  estado: 'en_progreso',
  presupuesto: 5000,
  userId: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ObraForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ObraForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findAllByText(/requerido|mayor a 0/i)).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered data for a new obra', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ObraForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nombre/i), 'Edificio Norte');
    await user.type(screen.getByLabelText(/presupuesto/i), '200000');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Edificio Norte', presupuesto: 200000 }),
    );
  });

  it('pre-fills the form when editing an existing obra', () => {
    render(<ObraForm obra={sampleObra} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Edificio Central');
    expect(screen.getByLabelText(/presupuesto/i)).toHaveValue(5000);
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ObraForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
