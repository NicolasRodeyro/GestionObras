import { Link, useParams } from 'react-router-dom';
import { useObra } from '../hooks/useObras';
import { AnotacionesList } from '../components/features/anotaciones/AnotacionesList';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const dateFormatter = new Intl.DateTimeFormat('es-AR');

export function ObraDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: obra, isLoading, isError } = useObra(id ?? '');

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <Link to="/obras" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
        ← Volver a Obras
      </Link>

      {isLoading && <p className="mt-4">Cargando obra...</p>}
      {isError && <p className="mt-4 text-red-600">Ocurrió un error al cargar la obra</p>}

      {obra && (
        <div className="mt-4 rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{obra.nombre}</h1>
          {obra.descripcion && <p className="mt-2 text-gray-700 dark:text-gray-300">{obra.descripcion}</p>}

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Estado</dt>
              <dd className="text-gray-900 dark:text-gray-100">{obra.estado}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Presupuesto</dt>
              <dd className="text-gray-900 dark:text-gray-100">{currencyFormatter.format(obra.presupuesto)}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Fecha de inicio</dt>
              <dd className="text-gray-900 dark:text-gray-100">
                {obra.fechaInicio ? dateFormatter.format(new Date(obra.fechaInicio)) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Fecha de fin</dt>
              <dd className="text-gray-900 dark:text-gray-100">
                {obra.fechaFin ? dateFormatter.format(new Date(obra.fechaFin)) : '—'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {obra && <AnotacionesList obraId={obra.id} />}
    </div>
  );
}
