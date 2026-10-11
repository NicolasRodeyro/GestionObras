import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Obras } from './pages/Obras';
import { ObraDetail } from './pages/ObraDetail';
import { Gastos } from './pages/Gastos';
import { Empleados } from './pages/Empleados';
import { EmpleadoDetail } from './pages/EmpleadoDetail';
import { Quincena } from './pages/Quincena';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/obras" element={<Obras />} />
          <Route path="/obras/:id" element={<ObraDetail />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/empleados/:id" element={<EmpleadoDetail />} />
          <Route path="/quincena" element={<Quincena />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
