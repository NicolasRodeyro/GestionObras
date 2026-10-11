import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AnotacionInput } from '../../../types/anotacion';

const anotacionFormSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  prioridad: z.enum(['baja', 'media', 'alta']),
});

type AnotacionFormValues = z.infer<typeof anotacionFormSchema>;

interface AnotacionFormProps {
  onSubmit: (input: AnotacionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AnotacionForm({ onSubmit, onCancel, isSubmitting }: AnotacionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnotacionFormValues>({
    resolver: zodResolver(anotacionFormSchema),
    defaultValues: { titulo: '', descripcion: '', prioridad: 'media' },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      titulo: values.titulo,
      descripcion: values.descripcion || undefined,
      prioridad: values.prioridad,
    });
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Título
        </label>
        <input
          id="titulo"
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          {...register('titulo')}
        />
        {errors.titulo && (
          <p className="text-sm text-red-600" role="alert">
            {errors.titulo.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción
        </label>
        <textarea
          id="descripcion"
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          {...register('descripcion')}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Prioridad
        </label>
        <select
          id="prioridad"
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          {...register('prioridad')}
        >
          <option value="baja">baja</option>
          <option value="media">media</option>
          <option value="alta">alta</option>
        </select>
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
