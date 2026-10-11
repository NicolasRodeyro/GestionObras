import { beforeEach, describe, expect, it } from 'vitest';
import { api } from './api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth';

const testUser: User = { id: '1', email: 'a@b.com', nombre: 'A', rol: 'admin' };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe('api client', () => {
  it('attaches the Authorization header when a token is present', async () => {
    useAuthStore.getState().setAuth(testUser, 'fake-token');

    const config = await api.interceptors.request.handlers![0]!.fulfilled!({ headers: {} } as any);

    expect(config.headers.Authorization).toBe('Bearer fake-token');
  });

  it('does not attach an Authorization header when there is no token', async () => {
    const config = await api.interceptors.request.handlers![0]!.fulfilled!({ headers: {} } as any);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
