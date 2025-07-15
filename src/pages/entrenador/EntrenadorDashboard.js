import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './EntrenadorDashboard.css';
import './Clientes/Clientes.css';
import './Clases/Clases.css';
import './Mensajes/Mensajes.css';
import './Reportes/Reportes.css';
import './Rutinas/Rutinas.css';

const EntrenadorDashboard = () => {
  const navigate = useNavigate();

  // Simulación de datos (puedes conectar a backend luego)
  const resumen = [
    { icon: 'bi-people-fill', label: 'Clientes Asignados', value: 12, color: '#1976d2', route: '/entrenador/clientes' },
    { icon: 'bi-calendar-event', label: 'Clases Asignadas', value: 8, color: '#43a047', route: '/entrenador/horarios' },
    { icon: 'bi-chat-dots', label: 'Mensajes', value: 3, color: '#ff9800', route: '/entrenador/mensajes' },
    { icon: 'bi-bar-chart-line', label: 'Reportes', value: 5, color: '#6d4aff', route: '/entrenador/reportes' },
  ];

  return (
    <div className="dashboard-layout">
      <main className="main-content">
        <h2 style={{ color: '#1976d2', marginBottom: '24px' }}>Panel del Entrenador</h2>
      <div className="admin-cards">
        {resumen.map((item, idx) => (
          <div
            className="admin-card"
            style={{ borderLeft: `6px solid ${item.color}` }}
            key={item.label}
            onClick={() => navigate(item.route)}
          >
            <span className="card-icon">
              <i className={`bi ${item.icon}`}></i>
            </span>
            <span className="card-title">{item.label}</span>
            <span className="card-value">{item.value}</span>
            <button className="card-btn">Ir →</button>
          </div>
        ))}
      </div>
      <div className="admin-panels">
        <div className="admin-panel">
          <div className="panel-title"><span role="img" aria-label="progreso">📈</span> Progreso de tus clientes</div>
          <div className="panel-content">
            <p>Aquí podrás ver métricas y reportes de avance de tus clientes.</p>
          </div>
        </div>
        <div className="admin-panel">
          <div className="panel-title"><span role="img" aria-label="clases">🗓️</span> Próximas clases</div>
          <div className="panel-content">
            <p>Listado de tus próximas clases programadas.</p>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default EntrenadorDashboard;
