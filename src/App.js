import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const handleLogout = () => setUser(null);

  let panel = null;
  let PanelLayout = null;
  if (user.role === 'admin') {
    PanelLayout = (props) => <AdminPanel onLogout={handleLogout} {...props} />;
  } else if (user.role === 'trainer') {
    PanelLayout = (props) => <TrainerPanel onLogout={handleLogout} {...props} />;
  } else if (user.role === 'client') {
    PanelLayout = (props) => <ClientPanel onLogout={handleLogout} {...props} />;
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<PanelLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="entrenadores" element={<Entrenadores />} />
            <Route path="clases" element={<Clases />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="ventas-finanzas" element={<VentasFinanzas />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="facturas" element={<Facturas />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
