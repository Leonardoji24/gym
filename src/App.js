import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import AdminPanel from './components/AdminPanel/AdminPanel';
import TrainerPanel from './components/TrainerPanel/TrainerPanel';
import ClientPanel from './components/ClientPanel/ClientPanel';
import Clientes from './pages/Clientes';
import Entrenadores from './pages/Entrenadores';
import Clases from './pages/Clases';
import Inventario from './pages/Inventario';
import VentasFinanzas from './pages/VentasFinanzas';
import Reportes from './pages/Reportes';
import Facturas from './pages/Facturas';
import Asistencias from './pages/Asistencias';
import Dashboard from './components/AdminPanel/Dashboard';
import { authService } from './services/api';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
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
        <Route path="/" element={user ? <PanelLayout {...panelProps} /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="entrenadores" element={<Entrenadores />} />
          <Route path="clases" element={<Clases />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="ventas-finanzas" element={<VentasFinanzas />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="asistencias" element={<Asistencias />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
