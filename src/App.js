import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import AdminPanel from './components/AdminPanel/AdminPanel';
import TrainerPanel from './components/TrainerPanel/TrainerPanel';
import ClientPanel from './components/ClientPanel/ClientPanel';
import Clientes from './pages/admin/Clientes';
import Entrenadores from './pages/admin/Entrenadores';
import Clases from './pages/admin/Clases';
import Inventario from './pages/admin/Inventario';
import VentasFinanzas from './pages/admin/VentasFinanzas';
import Reportes from './pages/admin/Reportes';
import Facturas from './pages/admin/Facturas';

import Dashboard from './components/AdminPanel/Dashboard';
// Trainer Panel Components
import EntrenadorDashboard from './pages/entrenador/EntrenadorDashboard';
import EntrenadorClientes from './pages/entrenador/Clientes/Clientes';
import EntrenadorClases from './pages/entrenador/Clases/Clases';
import EntrenadorRutinas from './pages/entrenador/Rutinas/Rutinas';
import NuevaRutina from './pages/entrenador/Rutinas/NuevaRutina';
import DetalleRutina from './pages/entrenador/Rutinas/DetalleRutina';
import AsignarRutina from './pages/entrenador/Rutinas/AsignarRutina';
import EntrenadorReportes from './pages/entrenador/Reportes/Reportes';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Función para obtener el layout según el rol
  const getLayout = (role) => {
    switch (role) {
      case 'admin':
        return (props) => <AdminPanel {...props} />;
      case 'trainer':
        return (props) => <TrainerPanel {...props} />;
      case 'receptionist':
      default:
        return (props) => <ClientPanel {...props} />;
    }
  };

  const PanelLayout = currentUser ? getLayout(currentUser.role) : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminPanel>
              <Outlet />
            </AdminPanel>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="entrenadores" element={<Entrenadores />} />
          <Route path="clases" element={<Clases />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="ventas-finanzas" element={<VentasFinanzas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        
        {/* Trainer Routes */}
        <Route 
          path="/entrenador" 
          element={
            <TrainerPanel>
              <Outlet />
            </TrainerPanel>
          }
        >
          <Route index element={<EntrenadorDashboard />} />
          <Route path="clientes" element={<EntrenadorClientes />} />
          <Route path="clases" element={<EntrenadorClases />} />
          <Route path="rutinas" element={<EntrenadorRutinas />} />
          <Route path="rutinas/nueva" element={<NuevaRutina />} />
          <Route path="rutinas/:id" element={<DetalleRutina />} />
          <Route path="rutinas/:id/asignar" element={<AsignarRutina />} />
          <Route path="reportes" element={<EntrenadorReportes />} />
          <Route path="*" element={<Navigate to="/entrenador" replace />} />
        </Route>
        
        {/* Root route - Redirect based on role */}
        <Route 
          path="/" 
          element={
            currentUser ? (
              currentUser.role === 'admin' ? 
                <Navigate to="/admin" replace /> : 
                currentUser.role === 'trainer' ?
                <Navigate to="/entrenador" replace /> :
                <Navigate to="/cliente" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
