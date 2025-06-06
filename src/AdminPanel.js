import React, { useState } from 'react';
import './AdminPanel.css';

const AdminPanel = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cierra el sidebar al hacer clic en un enlace o fondo oscuro
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div>
      {/* Overlay para móvil */}
      {sidebarOpen && <div className="admin-overlay" onClick={closeSidebar}></div>}
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="logo">
          <span className="logo-circle">R</span> Resistencia
        </div>
        <nav>
          <a href="#" className="active" onClick={closeSidebar}> <span role="img" aria-label="resumen">🕒</span> Resumen General </a>
          <a href="#" onClick={closeSidebar}> <span role="img" aria-label="clientes">👥</span> Gestión de Clientes </a>
          <a href="#" onClick={closeSidebar}> <span role="img" aria-label="entrenadores">📦</span> Gestión de Entrenadores </a>
          <a href="#" onClick={closeSidebar}> <span role="img" aria-label="clases">📝</span> Gestión de Clases </a>
          <a href="#" onClick={closeSidebar}> <span role="img" aria-label="inventario">📁</span> Inventario </a>
          <a href="#" onClick={closeSidebar}> <span role="img" aria-label="finanzas">💳</span> Ventas y Finanzas </a>
        </nav>
        <button className="logout-btn" onClick={onLogout}>Cerrar sesión</button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {/* Navbar */}
        <div className="admin-navbar">
          {/* Botón hamburguesa solo visible en móvil */}
          <button
            className="admin-burger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>
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
