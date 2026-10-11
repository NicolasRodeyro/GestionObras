import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnotacionForm } from './AnotacionForm';

describe('AnotacionForm', () => {
  it('shows a validation error when titulo is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnotacionForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/requerido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered data with default prioridad media', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnotacionForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/título/i), 'Revisar plano');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Revisar plano', prioridad: 'media' }),
    );
  });

  it('allows selecting a different prioridad', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnotacionForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/título/i), 'Revisar plano');
    await user.selectOptions(screen.getByLabelText(/prioridad/i), 'alta');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ prioridad: 'alta' }));
  });
});
