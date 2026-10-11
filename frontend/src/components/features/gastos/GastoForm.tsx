import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Obra } from '../../../types/obra';
import type { Gasto, GastoInput } from '../../../types/gasto';

const CATEGORIAS: Gasto['categoria'][] = ['materiales', 'mano_obra', 'equipos', 'servicios', 'otros'];

const gastoFormSchema = z.object({
  obraId: z.string().min(1, 'La obra es requerida'),
  categoria: z.enum(['materiales', 'mano_obra', 'equipos', 'servicios', 'otros']),
  monto: z.coerce.number({ message: 'El monto es requerido' }).positive('Debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  detalle: z.string().optional(),
});

type GastoFormInput = z.input<typeof gastoFormSchema>;
type GastoFormOutput = z.output<typeof gastoFormSchema>;

interface GastoFormProps {
  obras: Obra[];
  gasto?: Gasto;
  onSubmit: (input: GastoInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GastoForm({ obras, gasto, onSubmit, onCancel, isSubmitting }: GastoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GastoFormInput, unknown, GastoFormOutput>({
    resolver: zodResolver(gastoFormSchema),
    defaultValues: {
      obraId: gasto?.obraId ?? '',
      categoria: gasto?.categoria ?? 'materiales',
      monto: gasto?.monto,
      fecha: gasto?.fecha?.slice(0, 10) ?? '',
      detalle: gasto?.detalle ?? '',
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      obraId: values.obraId,
      categoria: values.categoria,
      monto: values.monto,
      fecha: values.fecha,
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
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoría
          </label>
          <select
            id="categoria"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('categoria')}
          >
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Monto
          </label>
          <input
            id="monto"
            type="number"
            step="0.01"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            {...register('monto')}
          />
          {errors.monto && (
            <p className="text-sm text-red-600" role="alert">
              {errors.monto.message}
            </p>
          )}
        </div>
      </div>

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
        <label htmlFor="detalle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Detalle
        </label>
        <textarea
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
