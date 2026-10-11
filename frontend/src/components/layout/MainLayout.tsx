import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/obras', label: 'Obras' },
  { path: '/gastos', label: 'Gastos' },
  { path: '/empleados', label: 'Empleados' },
  { path: '/quincena', label: 'Quincena' },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gestión de Obras
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user?.nombre}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>

        {/* Sidebar - Right */}
        <aside
          className={`fixed right-0 top-[3.5rem] z-40 h-[calc(100vh-3.5rem)] w-64 transform border-l border-gray-200 bg-white shadow-lg transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 lg:relative lg:top-0 lg:h-[calc(100vh-3.5rem)] lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <nav className="space-y-1 p-4">
            <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Menú Principal
              </p>
            </div>

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
