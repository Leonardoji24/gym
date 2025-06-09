import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => (
  <>
    {/* Dashboard summary cards */}
    <div className="admin-dashboard">
      <div className="admin-cards">
        <div className="admin-card clients">
          <span className="card-icon"><i className="bi bi-people-fill"></i></span>
          <span className="card-title">Clientes Activos</span>
          <span className="card-value">0</span>
          <Link to="/clientes" className="card-btn">Ver Clientes →</Link>
        </div>
        <div className="admin-card trainers">
          <span className="card-icon"><i className="bi bi-person-badge"></i></span>
          <span className="card-title">Entrenadores</span>
          <span className="card-value">0</span>
          <Link to="/entrenadores" className="card-btn">Ver Entrenadores →</Link>
        </div>
        <div className="admin-card classes">
          <span className="card-icon"><i className="bi bi-calendar-event"></i></span>
          <span className="card-title">Clases Activas</span>
          <span className="card-value">0</span>
          <Link to="/clases" className="card-btn">Ver Clases →</Link>
        </div>
        <div className="admin-card income">
          <span className="card-icon"><i className="bi bi-cash-coin"></i></span>
          <span className="card-title">Ingresos del Mes</span>
          <span className="card-value">0</span>
          <Link to="/ventas-finanzas" className="card-btn">Ver Finanzas →</Link>
        </div>
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
  </>
);

export default Dashboard;
