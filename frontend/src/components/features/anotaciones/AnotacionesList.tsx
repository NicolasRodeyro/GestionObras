import { useState } from 'react';
import { Modal } from '../../common/Modal';
import { AnotacionForm } from './AnotacionForm';
import {
  useAnotaciones,
  useCreateAnotacion,
  useDeleteAnotacion,
  useUpdateAnotacion,
} from '../../../hooks/useAnotaciones';
import type { AnotacionInput } from '../../../types/anotacion';

const PRIORIDAD_CLASSES: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  media: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface AnotacionesListProps {
  obraId: string;
}

export function AnotacionesList({ obraId }: AnotacionesListProps) {
  const { data: anotaciones, isLoading, isError } = useAnotaciones(obraId);
  const createAnotacion = useCreateAnotacion();
  const updateAnotacion = useUpdateAnotacion();
  const deleteAnotacion = useDeleteAnotacion();

  const [formOpen, setFormOpen] = useState(false);

  const handleSubmit = (input: AnotacionInput) => {
    createAnotacion.mutate({ obraId, input }, { onSuccess: () => setFormOpen(false) });
  };

  const toggleCompletada = (id: string, completada: boolean) => {
    updateAnotacion.mutate({ id, input: { completada } }, {});
  };

  const handleDelete = (id: string) => {
    deleteAnotacion.mutate(id, {});
  };

  return (
    <div className="mt-4 rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Anotaciones</h2>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Agregar anotación
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Cargando anotaciones...</p>}
      {isError && <p className="text-sm text-red-600">Ocurrió un error al cargar las anotaciones</p>}
      {anotaciones && anotaciones.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay anotaciones</p>
      )}

      {anotaciones && anotaciones.length > 0 && (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {anotaciones.map((anotacion) => (
            <li key={anotacion.id} className="flex items-start gap-3 py-3">
              <input
                type="checkbox"
                checked={anotacion.completada}
                onChange={(e) => toggleCompletada(anotacion.id, e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <p
                  className={
                    anotacion.completada
                      ? 'text-sm text-gray-400 line-through dark:text-gray-500'
                      : 'text-sm text-gray-900 dark:text-gray-100'
                  }
                >
                  {anotacion.titulo}
                </p>
                {anotacion.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{anotacion.descripcion}</p>
                )}
                <span
                  className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${PRIORIDAD_CLASSES[anotacion.prioridad]}`}
                >
                  {anotacion.prioridad}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(anotacion.id)}
                className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Nueva anotación">
        <AnotacionForm
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={createAnotacion.isPending}
        />
      </Modal>
    </div>
  );
}
