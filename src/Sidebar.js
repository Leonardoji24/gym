import React, { useState } from 'react';
import './Sidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logoR from './assets/img/letrar.png';


const Sidebar = () => {
  const [finanzasOpen, setFinanzasOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <aside className={`app-sidebar bg-body-secondary shadow${sidebarOpen ? ' open' : ''}`} data-bs-theme="dark">
      {/* Sidebar Brand */}
      <div className="sidebar-brand">
        <a href="#" className="brand-link">
          <img src={logoR} alt="Resistencia Logo" className="brand-image opacity-75 shadow" />
          <span className="brand-text fw-light">Resistencia</span>
        </a>
      </div>
      {/* Sidebar Wrapper */}
      <div className="sidebar-wrapper">
        <nav className="mt-2">
          <ul className="nav sidebar-menu flex-column" role="menu" data-accordion="false">
  {/* Resumen General */}
  <li className="nav-item">
    <a href="#" className="nav-link">
      <i className="nav-icon bi bi-speedometer2"></i>
      <p>Resumen General</p>
    </a>
  </li>
  {/* Gestión de Clientes */}
  <li className="nav-item">
    <a href="#" className="nav-link">
      <i className="nav-icon bi bi-people-fill"></i>
      <p>Gestión de Clientes</p>
    </a>
  </li>
  {/* Gestión de Entrenadores */}
  <li className="nav-item">
    <a href="#" className="nav-link">
      <i className="nav-icon bi bi-box-seam"></i>
      <p>Gestión de Entrenadores</p>
    </a>
  </li>
  {/* Gestión de Clases */}
  <li className="nav-item">
    <a href="#" className="nav-link">
      <i className="nav-icon bi bi-pencil-square"></i>
      <p>Gestión de Clases</p>
    </a>
  </li>
  {/* Inventario */}
  <li className="nav-item">
    <a href="#" className="nav-link">
      <i className="nav-icon bi bi-box"></i>
      <p>Inventario</p>
    </a>
  </li>
  {/* Ventas y Finanzas */}
  <li className="nav-item dropdown-hover">
    <a href="#" className="nav-link" onClick={e => {e.preventDefault();setFinanzasOpen(!finanzasOpen);}}>
      <i className="nav-icon bi bi-cash-coin"></i>
      <p style={{display:'flex',alignItems:'center',margin:0}}>
        Ventas y Finanzas
        <i className="nav-arrow bi bi-chevron-down"></i>
      </p>
    </a>
    <ul className="nav nav-treeview" style={{display: finanzasOpen ? 'block' : 'none'}}>
      <li className="nav-item">
        <a href="#" className="nav-link">
          <i className="nav-icon bi bi-circle"></i>
          <p>Pagos</p>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className="nav-link">
          <i className="nav-icon bi bi-circle"></i>
          <p>Reportes</p>
        </a>
      </li>
      <li className="nav-item">
        <a href="#" className="nav-link">
          <i className="nav-icon bi bi-circle"></i>
          <p>Facturas</p>
        </a>
      </li>
    </ul>
  </li>
</ul>
        </nav>
      </div>
    </aside>
  );
}
      
 
export default Sidebar;
