
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import EntrenadorSidebar from '../EntrenadorSidebar';
import './TrainerPanel.css';
import '../Sidebar/Sidebar.css';

const TrainerPanel = ({ onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Overlay para móvil */}
      {sidebarOpen && <div className="admin-overlay" onClick={closeSidebar}></div>}
      
      <div className="trainer-panel">
        <EntrenadorSidebar onLogout={onLogout} user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="main-container">
          {/* Navbar */}
          <div className="admin-navbar fixed-navbar">
            <div className="navbar-left">
              <button 
                className="hamburger-button" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Abrir menú"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
            
            <div className="navbar-user-section">
              <button 
                onClick={onLogout} 
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
