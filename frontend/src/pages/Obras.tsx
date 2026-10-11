import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { ObraForm } from '../components/features/obras/ObraForm';
import { useCreateObra, useDeleteObra, useObras, useUpdateObra } from '../hooks/useObras';
import type { Obra, ObraInput } from '../types/obra';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function Obras() {
  const { data: obras, isLoading, isError } = useObras();
  const createObra = useCreateObra();
  const updateObra = useUpdateObra();
  const deleteObra = useDeleteObra();

  const [formOpen, setFormOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingObra(undefined);
    setFormOpen(true);
  };

  const openEdit = (obra: Obra) => {
    setEditingObra(obra);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (input: ObraInput) => {
    if (editingObra) {
      updateObra.mutate(
        { id: editingObra.id, input },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createObra.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteObra.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Obras</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nueva obra
        </button>
      </div>

      {isLoading && <p>Cargando obras...</p>}
      {isError && <p className="text-red-600">Ocurrió un error al cargar las obras</p>}

      {obras && (
        <table className="w-full border-collapse overflow-hidden rounded border border-gray-200 bg-white text-left text-sm dark:border-gray-700 dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Presupuesto</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">
                  <Link to={`/obras/${obra.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                    {obra.nombre}
                  </Link>
                </td>
                <td className="px-4 py-2">{obra.estado}</td>
                <td className="px-4 py-2">{currencyFormatter.format(obra.presupuesto)}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(obra)}
                      className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(obra.id)}
                      className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={formOpen} onClose={closeForm} title={editingObra ? 'Editar obra' : 'Nueva obra'}>
        <ObraForm
          obra={editingObra}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={createObra.isPending || updateObra.isPending}
        />
      </Modal>

      <Modal isOpen={deletingId !== null} onClose={() => setDeletingId(null)} title="Eliminar obra">
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ¿Seguro que querés eliminar esta obra? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
