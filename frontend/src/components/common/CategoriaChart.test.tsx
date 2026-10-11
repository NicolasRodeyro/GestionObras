import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoriaChart } from './CategoriaChart';

describe('CategoriaChart', () => {
  it('shows a message when there is no data', () => {
    render(<CategoriaChart data={{}} />);

    expect(screen.getByText(/sin datos/i)).toBeInTheDocument();
  });

  it('renders a legend entry for each categoria', () => {
    render(<CategoriaChart data={{ materiales: 300, mano_obra: 200 }} />);

    expect(screen.getByText(/materiales/i)).toBeInTheDocument();
    expect(screen.getByText(/mano_obra/i)).toBeInTheDocument();
  });
});
