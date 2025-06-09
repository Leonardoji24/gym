import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import logoR from '../../assets/img/letrar.png';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({
  sidebarOpen, setSidebarOpen, sidebarPinned, setSidebarPinned, sidebarHover, setSidebarHover
}) => {
  const [finanzasOpen, setFinanzasOpen] = useState(false);

  return (
    <>
      {/* Overlay para cerrar el sidebar tocando fuera */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:1100,background:'rgba(0,0,0,0.25)'}}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar visible solo en escritorio o cuando está abierto en móvil */}
      {(sidebarOpen || sidebarHover || sidebarPinned || window.innerWidth >= 900) && (
        <aside
          className={`app-sidebar bg-body-secondary shadow${(sidebarOpen || sidebarHover || sidebarPinned) ? ' open' : ''}`}
          data-bs-theme="dark"
          style={{zIndex:1300}}
          onMouseEnter={() => { if (!sidebarPinned) setSidebarHover(true); }}
          onMouseLeave={() => { if (!sidebarPinned) setSidebarHover(false); }}
        >
          <div className="sidebar-brand" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0.5rem 1.1rem'}}>
            <a
              href="#"
              className="brand-link"
              style={{cursor: 'pointer'}}
              onClick={e => {
                e.preventDefault();
                setSidebarPinned(pinned => !pinned);
                setSidebarOpen(false);
                setSidebarHover(false);
              }}
              aria-label="Fijar/Desfijar menú lateral"
            >
              <img src={logoR} alt="Resistencia Logo" className="brand-image opacity-75 shadow" style={{width: 42, height: 42, marginRight: 8}} />
              <span className="brand-text fw-light" style={{fontSize: 20, color:'#fff'}}>Resistencia</span>
            </a>
          </div>
          {/* Sidebar Wrapper */}
          <div className="sidebar-wrapper">
            <nav className="mt-2">
              <ul className="nav sidebar-menu flex-column" role="menu" data-accordion="false" onClick={() => { if(window.innerWidth<900) setSidebarOpen(false); }}>
                {/* Resumen General */}
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    <i className="nav-icon bi bi-speedometer2"></i>
                    <p>Resumen General</p>
                  </Link>
                </li>
                {/* Gestión de Clientes */}
                <li className="nav-item">
                  <Link to="/clientes" className="nav-link">
                    <i className="nav-icon bi bi-people-fill"></i>
                    <p>Gestión de Clientes</p>
                  </Link>
                </li>
                {/* Gestión de Entrenadores */}
                <li className="nav-item">
                  <Link to="/entrenadores" className="nav-link">
                    <i className="nav-icon bi bi-person-badge"></i>
                    <p>Gestión de Entrenadores</p>
                  </Link>
                </li>
                {/* Gestión de Clases */}
                <li className="nav-item">
                  <Link to="/clases" className="nav-link">
                    <i className="nav-icon bi bi-pencil-square"></i>
                    <p>Gestión de Clases</p>
                  </Link>
                </li>
                {/* Inventario */}
                <li className="nav-item">
                  <Link to="/inventario" className="nav-link">
                    <i className="nav-icon bi bi-box"></i>
                    <p>Inventario</p>
                  </Link>
                </li>
                {/* Ventas y Finanzas */}
                <li className="nav-item dropdown-hover">
                  <div className="nav-link" style={{cursor:'pointer'}} onClick={() => setFinanzasOpen(!finanzasOpen)}>
                    <i className="nav-icon bi bi-cash-coin"></i>
                    <p style={{display:'flex',alignItems:'center',margin:0}}>
                      Ventas y Finanzas
                      <i className="nav-arrow bi bi-chevron-down"></i>
                    </p>
                  </div>
                  {finanzasOpen && (
                    <ul className="nav nav-treeview" style={{background:'#23272b',margin:0,paddingLeft:28,borderRadius:'0 0 8px 8px'}}>
                      <li className="nav-item">
                        <Link to="/reportes" className="nav-link">
                          <i className="nav-icon bi bi-circle"></i>
                          <p>Reportes</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/facturas" className="nav-link">
                          <i className="nav-icon bi bi-circle"></i>
                          <p>Facturas</p>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
              <hr style={{margin: '1rem 0', borderColor: '#444'}} />
              <div className="sidebar-logout" style={{position: 'absolute', bottom: 0, width: '100%', paddingBottom: '2rem', display:'flex', justifyContent:'center'}}>
                <button
                  className="logout-btn"
                  style={{
                    background: 'linear-gradient(90deg,#ff5858,#ffae42)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 30,
                    padding: '0.75rem 2rem',
                    fontWeight: 600,
                    fontSize: 17,
                    boxShadow: '0 2px 8px #0002',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  onMouseOver={e => {e.currentTarget.style.transform='scale(1.06)';e.currentTarget.style.boxShadow='0 4px 16px #ffae4244';}}
                  onMouseOut={e => {e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 2px 8px #0002';}}
                  onClick={async e => {
                    e.preventDefault();
                    const btn = e.currentTarget;
                    btn.innerHTML = '<span style="display:flex;align-items:center"><i class="bi bi-box-arrow-right" style="font-size:20px;margin-right:10px"></i> Cerrando...</span>';
                    await new Promise(r=>setTimeout(r,1000));
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }}
                >
                  <i className="bi bi-box-arrow-right" style={{fontSize: 20, marginRight: 10}}></i>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;
