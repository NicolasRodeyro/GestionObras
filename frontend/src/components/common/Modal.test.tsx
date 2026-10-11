import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Título">
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('renders the title and children when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Título">
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Título">
        <p>Contenido</p>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
