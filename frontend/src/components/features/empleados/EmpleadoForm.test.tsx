import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmpleadoForm } from './EmpleadoForm';
import type { Empleado } from '../../../types/empleado';

describe('EmpleadoForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmpleadoForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findAllByText(/requerido|mayor a 0/i)).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered data for a new empleado', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmpleadoForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nombre/i), 'Juan Perez');
    await user.type(screen.getByLabelText(/tarifa/i), '250');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Juan Perez', tarifaPorHora: 250 }),
    );
  });

  it('pre-fills the form when editing an existing empleado', () => {
    const empleado: Empleado = {
      id: '1',
      nombre: 'Ana Gomez',
      email: 'ana@obra.com',
      dni: '30111222',
      tarifaPorHora: 300,
      estado: 'activo',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    render(<EmpleadoForm empleado={empleado} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Ana Gomez');
    expect(screen.getByLabelText(/tarifa/i)).toHaveValue(300);
  });
});
