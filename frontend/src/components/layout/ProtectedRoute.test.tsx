import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/auth';

const testUser: User = { id: '1', email: 'a@b.com', nombre: 'A', rol: 'admin' };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

function renderWithRoutes() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithRoutes();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    useAuthStore.getState().setAuth(testUser, 'fake-token');

    renderWithRoutes();

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
