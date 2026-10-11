import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth';

const testUser: User = { id: '1', email: 'a@b.com', nombre: 'Ana', rol: 'admin' };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: testUser, token: 'fake-token', isAuthenticated: true });
});

describe('Dashboard page', () => {
  it("greets the logged-in user by name", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText(/ana/i)).toBeInTheDocument();
  });

  it('logs out and clears the session when clicking the logout button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
