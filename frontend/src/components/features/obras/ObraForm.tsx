import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Obra, ObraInput } from '../../../types/obra';

const ESTADOS: Obra['estado'][] = ['planificada', 'en_progreso', 'pausada', 'finalizada'];

const obraFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  estado: z.enum(['planificada', 'en_progreso', 'pausada', 'finalizada']),
  presupuesto: z.coerce.number({ message: 'El presupuesto es requerido' }).positive('Debe ser mayor a 0'),
});

type ObraFormInput = z.input<typeof obraFormSchema>;
type ObraFormOutput = z.output<typeof obraFormSchema>;

interface ObraFormProps {
  obra?: Obra;
  onSubmit: (input: ObraInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ObraForm({ obra, onSubmit, onCancel, isSubmitting }: ObraFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ObraFormInput, unknown, ObraFormOutput>({
    resolver: zodResolver(obraFormSchema),
    defaultValues: {
      nombre: obra?.nombre ?? '',
      descripcion: obra?.descripcion ?? '',
      fechaInicio: obra?.fechaInicio?.slice(0, 10) ?? '',
      fechaFin: obra?.fechaFin?.slice(0, 10) ?? '',
      estado: obra?.estado ?? 'planificada',
      presupuesto: obra?.presupuesto,
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      fechaInicio: values.fechaInicio || undefined,
      fechaFin: values.fechaFin || undefined,
      estado: values.estado,
      presupuesto: values.presupuesto,
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha inicio
          </label>
          <input
            id="fechaInicio"
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('fechaInicio')}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha fin
          </label>
          <input
            id="fechaFin"
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('fechaFin')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="presupuesto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Presupuesto
          </label>
          <input
            id="presupuesto"
            type="number"
            step="0.01"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('presupuesto')}
          />
          {errors.presupuesto && (
            <p className="text-sm text-red-600" role="alert">
              {errors.presupuesto.message}
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
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
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
