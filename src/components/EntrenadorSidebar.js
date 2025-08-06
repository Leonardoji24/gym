import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EntrenadorSidebar.css';

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
  const sidebarRef = useRef(null);

  const handleNavigation = (route) => {
    navigate(route);
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  // Cerrar el sidebar al hacer clic fuera de él
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (event) => {
      // Verificar si el clic fue fuera del sidebar y no en el botón que lo abre
      const isClickInside = sidebarRef.current?.contains(event.target);
      const isHamburgerButton = event.target.closest('.hamburger-button, .navbar-toggler');

      if (!isClickInside && !isHamburgerButton) {
        setSidebarOpen(false);
      }
    };

    // Usar 'click' en lugar de 'mousedown' para mejor compatibilidad
    document.addEventListener('click', handleClickOutside, true);

    // Limpiar el event listener cuando el componente se desmonte o el sidebar se cierre
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [sidebarOpen, setSidebarOpen]);

  // Efecto para cerrar el sidebar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Verificar si el clic fue en el botón del menú hamburguesa
        const isHamburgerButton = event.target.closest('.hamburger-button');
        if (!isHamburgerButton) {
          setSidebarOpen(false);
        }
      }
    };

    // Agregar event listener solo si el sidebar está abierto
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div className={`sidebar-container ${sidebarOpen ? 'show' : ''}`}>
      <div ref={sidebarRef} className="entrenador-sidebar">
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
      </div>
    </div>
  );
};

export default EntrenadorSidebar;
