import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Obra } from '../../../types/obra';
import type { HorasInput } from '../../../types/empleado';

const horasFormSchema = z.object({
  obraId: z.string().min(1, 'La obra es requerida'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  horas: z.coerce.number({ message: 'Las horas son requeridas' }).min(0, 'No puede ser negativo'),
  detalle: z.string().optional(),
});

type HorasFormInput = z.input<typeof horasFormSchema>;
type HorasFormOutput = z.output<typeof horasFormSchema>;

interface HorasFormProps {
  obras: Obra[];
  onSubmit: (input: HorasInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function HorasForm({ obras, onSubmit, onCancel, isSubmitting }: HorasFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HorasFormInput, unknown, HorasFormOutput>({
    resolver: zodResolver(horasFormSchema),
    defaultValues: { obraId: '', fecha: '', horas: undefined, detalle: '' },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      obraId: values.obraId,
      fecha: values.fecha,
      horas: values.horas,
      detalle: values.detalle || undefined,
    });
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="obraId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Obra
        </label>
        <select
          id="obraId"
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          {...register('obraId')}
        >
          <option value="">Seleccionar obra</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nombre}
            </option>
          ))}
        </select>
        {errors.obraId && (
          <p className="text-sm text-red-600" role="alert">
            {errors.obraId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('fecha')}
          />
          {errors.fecha && (
            <p className="text-sm text-red-600" role="alert">
              {errors.fecha.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="horas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Horas
          </label>
          <input
            id="horas"
            type="number"
            step="0.5"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('horas')}
          />
          {errors.horas && (
            <p className="text-sm text-red-600" role="alert">
              {errors.horas.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="detalle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Detalle
        </label>
        <input
          id="detalle"
          className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          {...register('detalle')}
        />
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
