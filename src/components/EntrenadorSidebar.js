import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EntrenadorSidebar.css';
import './Sidebar/Sidebar.css';

const links = [
  { label: 'Dashboard', icon: 'bi-house', route: '/entrenador' },
  { label: 'Clientes', icon: 'bi-people', route: '/entrenador/clientes' },
  { label: 'Clases', icon: 'bi-calendar-event', route: '/entrenador/clases' },
  { label: 'Rutinas', icon: 'bi-list-check', route: '/entrenador/rutinas' },
  { label: 'Reportes', icon: 'bi-bar-chart-line', route: '/entrenador/reportes' },
  { label: 'Mensajes', icon: 'bi-chat-dots', route: '/entrenador/mensajes' },
];

const EntrenadorSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (route) => {
    navigate(route);
    if (window.innerWidth < 992) { // Close sidebar on mobile after navigation
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`entrenador-sidebar ${sidebarOpen ? 'show' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Entrenador</div>
        <button 
          className="close-sidebar" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
      <nav>
        <ul>
          {links.map(link => (
            <li
              key={link.route}
              className={location.pathname === link.route ? 'active' : ''}
              onClick={() => handleNavigation(link.route)}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default EntrenadorSidebar;
