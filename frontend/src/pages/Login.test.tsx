import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from './Login';
import { useAuthStore } from '../store/authStore';
import * as authService from '../services/auth';

vi.mock('../services/auth');

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  vi.restoreAllMocks();
});

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login page', () => {
  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findAllByText(/requerido|inválido/i)).not.toHaveLength(0);
  });

  it('logs in successfully and redirects to home', async () => {
    const user = userEvent.setup();
    const fakeUser = { id: '1', email: 'a@b.com', nombre: 'A', rol: 'admin' as const };
    vi.mocked(authService.login).mockResolvedValueOnce({ user: fakeUser, token: 'fake-token' });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'supersecret123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(screen.getByText('Home Page')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('fake-token');
  });

  it('shows an error message on invalid credentials', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { status: 401, data: { error: 'Credenciales inválidas' } },
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
