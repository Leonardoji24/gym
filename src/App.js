import React, { useState, useEffect } from 'react';
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
import { authService } from './services/api';
// Trainer Panel Components
import EntrenadorDashboard from './pages/entrenador/EntrenadorDashboard';
import EntrenadorClientes from './pages/entrenador/Clientes/Clientes';
import EntrenadorClases from './pages/entrenador/Clases/Clases';
import EntrenadorRutinas from './pages/entrenador/Rutinas/Rutinas';
import EntrenadorMensajes from './pages/entrenador/Mensajes/Mensajes';
import EntrenadorReportes from './pages/entrenador/Reportes/Reportes';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error verificando la sesión:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      // Limpiar el token del almacenamiento local
      localStorage.removeItem('token');
      
      // Opcional: Si tienes un endpoint de logout en el backend, puedes hacer una llamada aquí
      // await authService.logout();
      
      // Limpiar el estado del usuario
      setUser(null);
      
      // Forzar una recarga completa para limpiar el estado de la aplicación
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Asegurarse de limpiar el estado incluso si hay un error
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Función para obtener el layout según el rol
  const getLayout = (role) => {
    switch (role) {
      case 'admin':
        return (props) => <AdminPanel onLogout={handleLogout} user={user} {...props} />;
      case 'trainer':
        return (props) => <TrainerPanel onLogout={handleLogout} user={user} {...props} />;
      case 'receptionist':
      default:
        return (props) => <ClientPanel onLogout={handleLogout} user={user} {...props} />;
    }
  };

  const PanelLayout = user ? getLayout(user.role) : null;

  // Pasar las props necesarias al PanelLayout
  const panelProps = {
    sidebarOpen: false,
    setSidebarOpen: () => {},
    sidebarPinned: false,
    setSidebarPinned: () => {},
    sidebarHover: false,
    setSidebarHover: () => {}
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminPanel onLogout={handleLogout} user={user}>
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
            <TrainerPanel onLogout={handleLogout} user={user}>
              <Outlet />
            </TrainerPanel>
          }
        >
          <Route index element={<EntrenadorDashboard />} />
          <Route path="clientes" element={<EntrenadorClientes />} />
          <Route path="clases" element={<EntrenadorClases />} />
          <Route path="rutinas" element={<EntrenadorRutinas />} />
          <Route path="mensajes" element={<EntrenadorMensajes />} />
          <Route path="reportes" element={<EntrenadorReportes />} />
          <Route path="*" element={<Navigate to="/entrenador" replace />} />
        </Route>
        
        {/* Root route - Redirect based on role */}
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'admin' ? 
                <Navigate to="/admin" replace /> : 
                user.role === 'trainer' ?
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
