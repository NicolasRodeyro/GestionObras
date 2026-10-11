import { describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { login, register, me } from './auth';

vi.mock('./api', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}));

describe('auth service', () => {
  it('login posts credentials and returns user + token', async () => {
    const payload = { user: { id: '1', email: 'a@b.com', nombre: 'A', rol: 'admin' }, token: 'tok' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: payload });

    const result = await login('a@b.com', 'password123');

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'password123' });
    expect(result).toEqual(payload);
  });

  it('register posts new user data and returns user + token', async () => {
    const payload = { user: { id: '2', email: 'b@b.com', nombre: 'B', rol: 'empleado' }, token: 'tok2' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: payload });

    const result = await register('b@b.com', 'password123', 'B');

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'b@b.com',
      password: 'password123',
      nombre: 'B',
    });
    expect(result).toEqual(payload);
  });

  it('me fetches the current user', async () => {
    const user = { id: '1', email: 'a@b.com', nombre: 'A', rol: 'admin' };
    vi.mocked(api.get).mockResolvedValueOnce({ data: { user } });

    const result = await me();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });
});
