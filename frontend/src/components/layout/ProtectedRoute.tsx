import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MainLayout } from './MainLayout';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}
