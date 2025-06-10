import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import Dashboard from './components/AdminPanel/Dashboard';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userData = response.data;
      const roleMap = {
        'admin': 'admin',
        'entrenador': 'trainer',
        'recepcionista': 'receptionist',
        'cliente': 'client'
      };

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.nombre,
        role: roleMap[userData.rol_nombre] || 'client',
        token
      });
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {user ? (
            // Rutas protegidas - usuario autenticado
            <Route path="/" element={<PanelLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="entrenadores" element={<Entrenadores />} />
              <Route path="clases" element={<Clases />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="ventas-finanzas" element={<VentasFinanzas />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="facturas" element={<Facturas />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          ) : (
            // Rutas públicas - usuario no autenticado
            <Route path="/" element={<Login onLogin={handleLogin} />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
