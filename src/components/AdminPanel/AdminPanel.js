import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './AdminPanel.css';
import '../../components/Sidebar/Sidebar.css';

const AdminPanel = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  // Cierra el sidebar al hacer clic en un enlace o fondo oscuro
  const closeSidebar = () => setSidebarOpen(false);


  return (
    <div>
      {/* Overlay para móvil */}
      {sidebarOpen && <div className="admin-overlay" onClick={closeSidebar}></div>}
      <div className="admin-layout">
        {/* Nuevo Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarPinned={sidebarPinned}
          setSidebarPinned={setSidebarPinned}
          sidebarHover={sidebarHover}
          setSidebarHover={setSidebarHover}
        />
        {/* Main content */}
        <main className="main-container">
          {/* Navbar */}
          <div className="admin-navbar fixed-navbar">
            <div className="navbar-shortcuts">
              <Link to="clientes" className="shortcut-link" title="Clientes">
                <i className="bi bi-people-fill"></i>
              </Link>
              <Link to="entrenadores" className="shortcut-link" title="Entrenadores">
                <i className="bi bi-person-badge"></i>
              </Link>
              <Link to="clases" className="shortcut-link" title="Clases">
                <i className="bi bi-pencil-square"></i>
              </Link>
              <Link to="inventario" className="shortcut-link" title="Inventario">
                <i className="bi bi-box"></i>
              </Link>
              <Link to="ventas-finanzas" className="shortcut-link" title="Finanzas">
                <i className="bi bi-cash-coin"></i>
              </Link>
              <Link to="reportes" className="shortcut-link" title="Reportes">
                <i className="bi bi-calendar-check"></i>
              </Link>
            </div>
            {/* Botón hamburguesa solo visible en móvil */}
            {window.innerWidth <= 900 ? (
              <>
                <button
                  className="admin-burger"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir menú"
                >
                  <span />
                  <span />
                  <span />
                </button>
              </>
            ) : (
              <div className="navbar-user-section">
                <button 
                  onClick={onLogout} 
                  className="logout-button"
                  title="Cerrar sesión"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="logout-text">Cerrar  sesión</span>
                </button>
              </div>
            )}
          </div>
          {/* Aquí se renderizan las páginas según la ruta */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
