import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../types/auth';

const testUser: User = { id: '1', email: 'a@b.com', nombre: 'A', rol: 'admin' };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe('authStore', () => {
  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setAuth logs the user in', () => {
    useAuthStore.getState().setAuth(testUser, 'fake-token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(testUser);
    expect(state.token).toBe('fake-token');
  });

  it('logout clears the session', () => {
    useAuthStore.getState().setAuth(testUser, 'fake-token');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('persists the session to localStorage', () => {
    useAuthStore.getState().setAuth(testUser, 'fake-token');

    const raw = localStorage.getItem('auth-storage');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.token).toBe('fake-token');
  });
});
