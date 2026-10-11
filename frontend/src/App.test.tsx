import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthStore } from './store/authStore';
import type { User } from './types/auth';

const testUser: User = { id: '1', email: 'a@b.com', nombre: 'Ana', rol: 'admin' };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  window.history.pushState({}, '', '/');
});

describe('App routing', () => {
  it('redirects an unauthenticated visitor at "/" to the login page', async () => {
    const { App } = await import('./App');
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /iniciar sesión/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('shows the dashboard at "/" when authenticated', async () => {
    useAuthStore.getState().setAuth(testUser, 'fake-token');
    const { App } = await import('./App');

    render(<App />);

    expect(await screen.findByText(/ana/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
