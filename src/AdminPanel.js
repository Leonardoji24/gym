import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './AdminPanel.css';
import './Sidebar.css';

const AdminPanel = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);

  // Cierra el sidebar al hacer clic en un enlace o fondo oscuro
  const closeSidebar = () => setSidebarOpen(false);

  // Sidebar en escritorio: hover para mostrar/ocultar
  const handleSidebarMouseEnter = () => {
    if (window.innerWidth > 900) setSidebarHover(true);
  };
  const handleSidebarMouseLeave = () => {
    if (window.innerWidth > 900) setSidebarHover(false);
  };

  // Sidebar abierto si está abierto por botón hamburguesa (móvil) o hover (escritorio)
  const sidebarShouldBeOpen = sidebarOpen || sidebarHover;

  return (
    <div>
      {/* Overlay para móvil */}
      {sidebarOpen && <div className="admin-overlay" onClick={closeSidebar}></div>}
      {/* Nuevo Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="admin-main">
        {/* Navbar */}
        <div className="admin-navbar">
          {/* Botón hamburguesa solo visible en móvil */}
          {window.innerWidth <= 900 && (
            <button
              className="admin-burger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <span />
              <span />
              <span />
            </button>
          )}
          <a href="#" className="nav-link active">Inicio</a>
          <a href="#" className="nav-link">Registro de clientes</a>
          <a href="#" className="nav-link">Entrenadores</a>
          <a href="#" className="nav-link">Clases</a>
          <a href="#" className="nav-link">Inventario</a>
          <a href="#" className="nav-link">Finanzas</a>
        </div>

        {/* Dashboard summary cards */}
        <div className="admin-dashboard">
          <div className="admin-cards">
            <div className="admin-card clients">
              <span className="card-icon" role="img" aria-label="clientes">👥</span>
              <span className="card-title">Clientes Activos</span>
              <span className="card-value">0</span>
              <button className="card-btn">Ver Clientes →</button>
            </div>
            <div className="admin-card trainers">
              <span className="card-icon" role="img" aria-label="entrenadores">🧑‍💻</span>
              <span className="card-title">Entrenadores</span>
              <span className="card-value">0</span>
              <button className="card-btn">Ver Entrenadores →</button>
            </div>
            <div className="admin-card classes">
              <span className="card-icon" role="img" aria-label="clases">📅</span>
              <span className="card-title">Clases Activas</span>
              <span className="card-value">0</span>
              <button className="card-btn">Ver Clases →</button>
            </div>
            <div className="admin-card income">
              <span className="card-icon" role="img" aria-label="finanzas">💲</span>
              <span className="card-title">Ingresos del Mes</span>
              <span className="card-value">0</span>
              <button className="card-btn">Ver Finanzas →</button>
            </div>
          </div>

          {/* Dashboard panels */}
          <div className="admin-panels">
            <div className="admin-panel">
              <div className="panel-title"><span role="img" aria-label="asistencia">📈</span> Asistencia Mensual</div>
              {/* Aquí iría una gráfica o datos */}
            </div>
            <div className="admin-panel">
              <div className="panel-title"><span role="img" aria-label="populares">📊</span> Clases más Populares</div>
              {/* Aquí iría una gráfica o datos */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
