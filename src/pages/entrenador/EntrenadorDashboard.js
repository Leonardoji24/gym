import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './EntrenadorDashboard.css';

const EntrenadorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulación de datos (puedes conectar a backend luego)
  const [resumen, setResumen] = useState([
    { 
      icon: 'bi-people-fill', 
      label: 'Clientes Asignados', 
      value: 0, 
      color: '#4e73df', 
      route: '/entrenador/clientes' 
    },
    { 
      icon: 'bi-calendar-event', 
      label: 'Clases Asignadas', 
      value: 0, 
      color: '#1cc88a', 
      route: '/entrenador/horarios' 
    },
    { 
      icon: 'bi-chat-dots', 
      label: 'Mensajes', 
      value: 0, 
      color: '#f6c23e', 
      route: '/entrenador/mensajes' 
    },
    { 
      icon: 'bi-bar-chart-line', 
      label: 'Reportes', 
      value: 0, 
      color: '#e74a3b', 
      route: '/entrenador/reportes' 
    },
  ]);

  // Datos de ejemplo para las próximas clases
  const [proximasClases, setProximasClases] = useState([
    { 
      id: 1, 
      nombre: 'Spinning Avanzado', 
      fecha: 'Hoy', 
      hora: '18:00 - 19:00', 
      clientes: 8,
      instructor: 'María López',
      asistencia: 15
    },
    { 
      id: 2, 
      nombre: 'Funcional', 
      fecha: 'Mañana', 
      hora: '09:00 - 10:00', 
      clientes: 5,
      instructor: 'Carlos Méndez',
      asistencia: 12
    },
    { 
      id: 3, 
      nombre: 'Yoga', 
      fecha: 'Jueves', 
      hora: '17:00 - 18:00', 
      clientes: 6,
      instructor: 'Ana Torres',
      asistencia: 10
    },
  ]);

  // Datos de ejemplo para el progreso de clientes
  const [progresoClientes, setProgresoClientes] = useState([
    { 
      id: 1, 
      nombre: 'Juan Pérez', 
      progreso: 75, 
      meta: 'Bajar 5kg',
      semanas: '12/16',
      ultimoEntreno: 'Ayer'
    },
    { 
      id: 2, 
      nombre: 'María Gómez', 
      progreso: 40, 
      meta: 'Tonificar',
      semanas: '6/12',
      ultimoEntreno: 'Hace 2 días'
    },
    { 
      id: 3, 
      nombre: 'Carlos López', 
      progreso: 90, 
      meta: 'Maratón',
      semanas: '8/10',
      ultimoEntreno: 'Hoy'
    },
  ]);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Actualizar resumen con datos simulados
        setResumen(prevResumen => {
          const newResumen = [...prevResumen];
          newResumen[0].value = 12; // Clientes
          newResumen[1].value = 8;  // Clases
          newResumen[2].value = 3;  // Mensajes
          newResumen[3].value = 5;  // Reportes
          return newResumen;
        });
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
        console.error('Error:', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Función para renderizar la barra de progreso
  const renderProgressBar = (progreso) => {
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
        <div className="progress-info">
          <span>{progreso}% completado</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="main-content">
          <h2>Panel del Entrenador</h2>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <div className="main-content">
          <h2>Panel del Entrenador</h2>
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="main-content">
        <div className="page-container">
          {/* Resumen */}
          <h2>Resumen</h2>
          <div className="admin-cards">
            {resumen.map((item, index) => (
              <div 
                key={index} 
                className="admin-card"
                onClick={() => navigate(item.route)}
              >
                <div className="card-icon" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`bi ${item.icon}`} style={{ color: item.color }}></i>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{item.label}</h3>
                  <p className="card-value" style={{ color: item.color }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Paneles Inferiores */}
          <div className="admin-panels">
            {/* Panel de Progreso de Clientes */}
            <div className="admin-panel">
              <div className="panel-title">
                <i className="bi bi-graph-up"></i> Progreso de Clientes
              </div>
              <div className="panel-content" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem' }}>
                {progresoClientes.length > 0 ? (
                  <div style={{ width: '100%' }}>
                    {progresoClientes.map(cliente => (
                      <div key={cliente.id} style={{ marginBottom: '1.5rem', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#2c3e50' }}>{cliente.nombre}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                              {cliente.meta} • {cliente.semanas} • Último: {cliente.ultimoEntreno}
                            </div>
                          </div>
                          <div style={{ fontWeight: 600, color: '#4e73df' }}>
                            {cliente.progreso}%
                          </div>
                        </div>
                        {renderProgressBar(cliente.progreso)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-people"></i>
                    <p>No hay clientes asignados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Próximas Clases */}
            <div className="admin-panel">
              <div className="panel-title">
                <i className="bi bi-calendar3"></i> Próximas Clases
              </div>
              <div className="panel-content" style={{ padding: 0 }}>
                {proximasClases.length > 0 ? (
                  <table className="popular-classes-table">
                    <thead>
                      <tr>
                        <th>Clase</th>
                        <th>Horario</th>
                        <th>Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximasClases.map((clase) => (
                        <tr key={clase.id} onClick={() => navigate(`/entrenador/clase/${clase.id}`)}>
                          <td>
                            <div className="class-name">{clase.nombre}</div>
                            <div className="trainer-name">{clase.instructor}</div>
                          </td>
                          <td>
                            <div>{clase.fecha}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>{clase.hora}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="attendance-count">{clase.asistencia}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-calendar-x"></i>
                    <p>No hay clases programadas</p>
                  </div>
                )}
              </div>
            </div>
          </div> {/* Cierre de admin-panels */}
        </div> {/* Cierre de page-container */}
      </div> {/* Cierre de main-content */}
    </div> // Cierre de dashboard-layout
  );
};

export default EntrenadorDashboard;
