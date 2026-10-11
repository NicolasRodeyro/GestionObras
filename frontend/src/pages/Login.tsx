import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('El email es inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const { user, token } = await login(data.email, data.password);
      setAuth(user, token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? 'Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Iniciar sesión</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-600" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
