import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EntrenadorSidebar.css';

const links = [
  { label: 'Dashboard', icon: 'bi-house', route: '/entrenador' },
  { label: 'Clientes', icon: 'bi-people', route: '/entrenador/clientes' },
  { label: 'Clases', icon: 'bi-calendar-event', route: '/entrenador/clases' },
  { label: 'Rutinas', icon: 'bi-list-check', route: '/entrenador/rutinas' },
  { label: 'Reportes', icon: 'bi-bar-chart-line', route: '/entrenador/reportes' },
];

const EntrenadorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="entrenador-navigation">
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
  );
};

export default EntrenadorSidebar;
