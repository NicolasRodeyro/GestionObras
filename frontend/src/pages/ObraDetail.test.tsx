import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as useObrasHooks from '../hooks/useObras';
import * as useAnotacionesHooks from '../hooks/useAnotaciones';
import { ObraDetail } from './ObraDetail';
import type { Obra } from '../types/obra';

vi.mock('../hooks/useObras');
vi.mock('../hooks/useAnotaciones');

const sampleObra: Obra = {
  id: '1',
  nombre: 'Edificio Central',
  descripcion: 'Construcción de 8 pisos',
  fechaInicio: '2026-06-01T00:00:00.000Z',
  fechaFin: null,
  estado: 'en_progreso',
  presupuesto: 5000000,
  userId: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/obras/${id}`]}>
      <Routes>
        <Route path="/obras/:id" element={<ObraDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAnotacionesHooks.useAnotaciones).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useAnotaciones>);
  vi.mocked(useAnotacionesHooks.useCreateAnotacion).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useCreateAnotacion>);
  vi.mocked(useAnotacionesHooks.useUpdateAnotacion).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useUpdateAnotacion>);
  vi.mocked(useAnotacionesHooks.useDeleteAnotacion).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useAnotacionesHooks.useDeleteAnotacion>);
});

describe('ObraDetail page', () => {
  it('shows a loading state', () => {
    vi.mocked(useObrasHooks.useObra).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useObrasHooks.useObra>);

    renderAt('1');

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('shows the obra details when loaded', () => {
    vi.mocked(useObrasHooks.useObra).mockReturnValue({
      data: sampleObra,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useObrasHooks.useObra>);

    renderAt('1');

    expect(screen.getByRole('heading', { name: 'Edificio Central' })).toBeInTheDocument();
    expect(screen.getByText(/construcción de 8 pisos/i)).toBeInTheDocument();
    expect(screen.getByText(/en_progreso/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /anotaciones/i })).toBeInTheDocument();
  });

  it('shows an error state', () => {
    vi.mocked(useObrasHooks.useObra).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useObrasHooks.useObra>);

    renderAt('1');

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
