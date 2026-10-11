import { useMemo, useState } from 'react';
import { Modal } from '../components/common/Modal';
import { CategoriaChart } from '../components/common/CategoriaChart';
import { GastoForm } from '../components/features/gastos/GastoForm';
import { useObras } from '../hooks/useObras';
import { useCreateGasto, useDeleteGasto, useGastos, useResumenGastos, useUpdateGasto } from '../hooks/useGastos';
import type { Gasto, GastoFilters, GastoInput } from '../types/gasto';

const CATEGORIAS: Gasto['categoria'][] = ['materiales', 'mano_obra', 'equipos', 'servicios', 'otros'];
const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const dateFormatter = new Intl.DateTimeFormat('es-AR');

export function Gastos() {
  const [filters, setFilters] = useState<GastoFilters>({});
  const { data: obras } = useObras();
  const { data, isLoading, isError } = useGastos(filters);
  const { data: resumen } = useResumenGastos({ obraId: filters.obraId, desde: filters.desde, hasta: filters.hasta });

  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();
  const deleteGasto = useDeleteGasto();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const obraNombreById = useMemo(() => {
    const map = new Map<string, string>();
    obras?.forEach((obra) => map.set(obra.id, obra.nombre));
    return map;
  }, [obras]);

  const openCreate = () => {
    setEditingGasto(undefined);
    setFormOpen(true);
  };

  const openEdit = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (input: GastoInput) => {
    if (editingGasto) {
      updateGasto.mutate({ id: editingGasto.id, input }, { onSuccess: () => setFormOpen(false) });
    } else {
      createGasto.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteGasto.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
  };

  const updateFilter = (patch: Partial<GastoFilters>) => setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gastos</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nuevo gasto
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="filtroObra" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Filtrar por obra
          </label>
          <select
            id="filtroObra"
            value={filters.obraId ?? ''}
            onChange={(e) => updateFilter({ obraId: e.target.value || undefined })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="">Todas</option>
            {obras?.map((obra) => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="filtroCategoria" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Categoría
          </label>
          <select
            id="filtroCategoria"
            value={filters.categoria ?? ''}
            onChange={(e) => updateFilter({ categoria: (e.target.value || undefined) as Gasto['categoria'] | undefined })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="filtroDesde" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Desde
          </label>
          <input
            id="filtroDesde"
            type="date"
            value={filters.desde ?? ''}
            onChange={(e) => updateFilter({ desde: e.target.value || undefined })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="filtroHasta" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Hasta
          </label>
          <input
            id="filtroHasta"
            type="date"
            value={filters.hasta ?? ''}
            onChange={(e) => updateFilter({ hasta: e.target.value || undefined })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading && <p>Cargando gastos...</p>}
          {isError && <p className="text-red-600">Ocurrió un error al cargar los gastos</p>}

          {data && (
            <>
              <table className="w-full border-collapse overflow-hidden rounded border border-gray-200 bg-white text-left text-sm dark:border-gray-700 dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Obra</th>
                    <th className="px-4 py-2">Categoría</th>
                    <th className="px-4 py-2">Detalle</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Monto</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gastos.map((gasto) => (
                    <tr key={gasto.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{obraNombreById.get(gasto.obraId) ?? gasto.obraId}</td>
                      <td className="px-4 py-2">{gasto.categoria}</td>
                      <td className="px-4 py-2">{gasto.detalle}</td>
                      <td className="px-4 py-2">{dateFormatter.format(new Date(gasto.fecha))}</td>
                      <td className="px-4 py-2">{currencyFormatter.format(gasto.monto)}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(gasto)}
                            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(gasto.id)}
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
              <p className="mt-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                Total: {currencyFormatter.format(data.total)}
              </p>
            </>
          )}
        </div>

        <div className="rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Gastos por categoría</h2>
          <CategoriaChart data={resumen ?? {}} />
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={closeForm} title={editingGasto ? 'Editar gasto' : 'Nuevo gasto'}>
        <GastoForm
          obras={obras ?? []}
          gasto={editingGasto}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={createGasto.isPending || updateGasto.isPending}
        />
      </Modal>

      <Modal isOpen={deletingId !== null} onClose={() => setDeletingId(null)} title="Eliminar gasto">
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ¿Seguro que querés eliminar este gasto? Esta acción no se puede deshacer.
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
