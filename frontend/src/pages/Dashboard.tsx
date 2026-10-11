export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Bienvenido al sistema de gestión de obras
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards - Empty placeholders */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Total Obras
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">-</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Gastos Este Mes
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">-</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Ingresos Este Mes
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">-</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Resultado Neto
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">-</p>
        </div>
      </div>
    </div>
  );
}
