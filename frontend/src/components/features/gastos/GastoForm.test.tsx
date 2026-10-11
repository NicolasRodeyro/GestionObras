import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GastoForm } from './GastoForm';
import type { Obra } from '../../../types/obra';
import type { Gasto } from '../../../types/gasto';

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
  {
    id: 'o2',
    nombre: 'Casa Sur',
    descripcion: null,
    fechaInicio: null,
    fechaFin: null,
    estado: 'planificada',
    presupuesto: 2000,
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('GastoForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<GastoForm obras={obras} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findAllByText(/requerido|mayor a 0/i)).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered data for a new gasto', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<GastoForm obras={obras} onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText(/obra/i), 'o2');
    await user.selectOptions(screen.getByLabelText(/categoría/i), 'equipos');
    await user.type(screen.getByLabelText(/monto/i), '750');
    await user.type(screen.getByLabelText(/fecha/i), '2026-06-15');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ obraId: 'o2', categoria: 'equipos', monto: 750, fecha: '2026-06-15' }),
    );
  });

  it('pre-fills the form when editing an existing gasto', () => {
    const gasto: Gasto = {
      id: 'g1',
      obraId: 'o1',
      monto: 500,
      categoria: 'materiales',
      detalle: 'Cemento',
      fecha: '2026-06-01T00:00:00.000Z',
      userId: 'u1',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };
    render(<GastoForm obras={obras} gasto={gasto} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/monto/i)).toHaveValue(500);
    expect(screen.getByLabelText(/obra/i)).toHaveValue('o1');
  });
});
