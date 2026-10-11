import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { HorasForm } from '../components/features/empleados/HorasForm';
import { useEmpleados, useHoras, useRegistrarHoras } from '../hooks/useEmpleados';
import { useObras } from '../hooks/useObras';
import type { HorasInput } from '../types/empleado';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const dateFormatter = new Intl.DateTimeFormat('es-AR');

const now = new Date();

export function EmpleadoDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: empleados } = useEmpleados();
  const { data: obras } = useObras();

  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [formOpen, setFormOpen] = useState(false);

  const { data: resumen, isLoading, isError } = useHoras(id ?? '', mes, anio);
  const registrarHoras = useRegistrarHoras();

  const empleado = empleados?.find((e) => e.id === id);

  const handleSubmit = (input: HorasInput) => {
    if (!id) return;
    registrarHoras.mutate({ empleadoId: id, input }, { onSuccess: () => setFormOpen(false) });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <Link to="/empleados" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
        ← Volver a Empleados
      </Link>

      {empleado && (
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{empleado.nombre}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tarifa: {currencyFormatter.format(empleado.tarifaPorHora)}/hora
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Registrar horas
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <div className="space-y-1">
          <label htmlFor="mes" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Mes
          </label>
          <select
            id="mes"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="anio" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Año
          </label>
          <input
            id="anio"
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </div>
      </div>

      {isLoading && <p className="mt-4">Cargando horas...</p>}
      {isError && <p className="mt-4 text-red-600">Ocurrió un error al cargar las horas</p>}

      {resumen && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Horas totales</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{resumen.totalHoras}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sueldo estimado</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currencyFormatter.format(resumen.sueldoEstimado)}
              </p>
            </div>
          </div>

          <table className="mt-4 w-full border-collapse overflow-hidden rounded border border-gray-200 bg-white text-left text-sm dark:border-gray-700 dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Horas</th>
                <th className="px-4 py-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {resumen.horasDetalle.map((hora) => (
                <tr key={hora.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{dateFormatter.format(new Date(hora.fecha))}</td>
                  <td className="px-4 py-2">{hora.horas}</td>
                  <td className="px-4 py-2">{hora.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Registrar horas">
        <HorasForm
          obras={obras ?? []}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={registrarHoras.isPending}
        />
      </Modal>
    </div>
  );
}
