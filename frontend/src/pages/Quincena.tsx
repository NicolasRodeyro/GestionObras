import { useState } from 'react';
import { useEmpleados } from '../hooks/useEmpleados';
import { useMarcarComoPagada, useQuincena } from '../hooks/useQuincena';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const now = new Date();

export function Quincena() {
  const { data: empleados } = useEmpleados();
  const [empleadoId, setEmpleadoId] = useState('');
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());

  const { data: quincena, isLoading, isError } = useQuincena(empleadoId, mes, anio);
  const marcarComoPagada = useMarcarComoPagada();

  const handlePagar = () => {
    if (!quincena) return;
    marcarComoPagada.mutate(quincena.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <h1 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Quincena</h1>

      <div className="flex flex-wrap gap-4 rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-1">
          <label htmlFor="empleadoId" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Empleado
          </label>
          <select
            id="empleadoId"
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="">Seleccionar empleado</option>
            {empleados?.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombre}
              </option>
            ))}
          </select>
        </div>
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

      {!empleadoId && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Seleccioná un empleado para calcular su quincena</p>
      )}

      {empleadoId && isLoading && <p className="mt-4">Calculando quincena...</p>}
      {empleadoId && isError && <p className="mt-4 text-red-600">Ocurrió un error al calcular la quincena</p>}

      {quincena && (
        <div className="mt-4 rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Horas totales</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{quincena.horasTotales}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tarifa por hora</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currencyFormatter.format(quincena.tarifaPorHora)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sueldo bruto</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currencyFormatter.format(quincena.sueldoBruto)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sueldo neto</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currencyFormatter.format(quincena.sueldoNeto)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">Estado: {quincena.estado}</span>
            {quincena.estado !== 'pagada' && (
              <button
                type="button"
                onClick={handlePagar}
                disabled={marcarComoPagada.isPending}
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Marcar como Pagado
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
