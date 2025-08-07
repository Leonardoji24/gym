
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import EntrenadorSidebar from '../EntrenadorSidebar';
import './TrainerPanel.css';
import { useAuth } from '../../contexts/AuthContext';

const TrainerPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="trainer-layout">
      <div className="trainer-panel">
        <aside className="trainer-sidebar">
          <EntrenadorSidebar />
        </aside>

        <main className="trainer-main-content">
          {/* Navbar simplificado */}
          <div className="admin-navbar">
            <div className="navbar-left">
              <button
                className="hamburger-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                aria-label="Abrir menú"
              >
                <span />
                <span />
                <span />
              </button>
              <h1 className="page-title">Panel de Entrenador</h1>
            </div>

            <div className="navbar-user-section">
              <span className="welcome-message">Bienvenido, {currentUser?.nombre || 'Entrenador'}</span>
              <button
                onClick={handleLogout}
                className="logout-button"
                title="Cerrar sesión"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="logout-text">Cerrar sesión</span>
              </button>
            </div>
          </div>

          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrainerPanel;
