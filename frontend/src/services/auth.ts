import { api } from './api';
import type { User } from '../types/auth';

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string, nombre: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, password, nombre });
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}
