import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Empleado, EmpleadoInput } from '../../../types/empleado';

const empleadoFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('El email es inválido').optional().or(z.literal('')),
  dni: z.string().optional(),
  tarifaPorHora: z.coerce.number({ message: 'La tarifa es requerida' }).positive('Debe ser mayor a 0'),
  estado: z.enum(['activo', 'inactivo']),
});

type EmpleadoFormInput = z.input<typeof empleadoFormSchema>;
type EmpleadoFormOutput = z.output<typeof empleadoFormSchema>;

interface EmpleadoFormProps {
  empleado?: Empleado;
  onSubmit: (input: EmpleadoInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EmpleadoForm({ empleado, onSubmit, onCancel, isSubmitting }: EmpleadoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpleadoFormInput, unknown, EmpleadoFormOutput>({
    resolver: zodResolver(empleadoFormSchema),
    defaultValues: {
      nombre: empleado?.nombre ?? '',
      email: empleado?.email ?? '',
      dni: empleado?.dni ?? '',
      tarifaPorHora: empleado?.tarifaPorHora,
      estado: empleado?.estado ?? 'activo',
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      nombre: values.nombre,
      email: values.email || undefined,
      dni: values.dni || undefined,
      tarifaPorHora: values.tarifaPorHora,
      estado: values.estado,
    });
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nombre
        </label>
        <input
          id="nombre"
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-sm text-red-600" role="alert">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
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
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            DNI
          </label>
          <input
            id="dni"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('dni')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="tarifaPorHora" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tarifa por hora
          </label>
          <input
            id="tarifaPorHora"
            type="number"
            step="0.01"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('tarifaPorHora')}
          />
          {errors.tarifaPorHora && (
            <p className="text-sm text-red-600" role="alert">
              {errors.tarifaPorHora.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estado
          </label>
          <select
            id="estado"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('estado')}
          >
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
