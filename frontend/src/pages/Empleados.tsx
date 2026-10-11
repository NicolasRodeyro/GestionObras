import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { EmpleadoForm } from '../components/features/empleados/EmpleadoForm';
import { useCreateEmpleado, useEmpleados, useUpdateEmpleado } from '../hooks/useEmpleados';
import type { Empleado, EmpleadoInput } from '../types/empleado';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function Empleados() {
  const { data: empleados, isLoading, isError } = useEmpleados();
  const createEmpleado = useCreateEmpleado();
  const updateEmpleado = useUpdateEmpleado();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | undefined>(undefined);

  const openCreate = () => {
    setEditingEmpleado(undefined);
    setFormOpen(true);
  };

  const openEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (input: EmpleadoInput) => {
    if (editingEmpleado) {
      updateEmpleado.mutate({ id: editingEmpleado.id, input }, { onSuccess: () => setFormOpen(false) });
    } else {
      createEmpleado.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Empleados</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nuevo empleado
        </button>
      </div>

      {isLoading && <p>Cargando empleados...</p>}
      {isError && <p className="text-red-600">Ocurrió un error al cargar los empleados</p>}

      {empleados && (
        <table className="w-full border-collapse overflow-hidden rounded border border-gray-200 bg-white text-left text-sm dark:border-gray-700 dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Tarifa/hora</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr key={empleado.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">
                  <Link
                    to={`/empleados/${empleado.id}`}
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {empleado.nombre}
                  </Link>
                </td>
                <td className="px-4 py-2">{currencyFormatter.format(empleado.tarifaPorHora)}</td>
                <td className="px-4 py-2">{empleado.estado}</td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => openEdit(empleado)}
                    className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={formOpen} onClose={closeForm} title={editingEmpleado ? 'Editar empleado' : 'Nuevo empleado'}>
        <EmpleadoForm
          empleado={editingEmpleado}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={createEmpleado.isPending || updateEmpleado.isPending}
        />
      </Modal>
    </div>
  );
}
