import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUserFriends,
  FaDumbbell,
  FaCalendarAlt,
  FaChartBar,
  FaClipboardList,
  FaBell,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './EntrenadorDashboard.css';

const EntrenadorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClientes: 0,
    clasesHoy: 0,
    rutinasActivas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'rutina',
      title: 'Cargando actividades...',
      time: '00:00',
      status: 'cargando',
      icon: <FaDumbbell />
    }
  ]);

  // Cargar datos reales del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Obtener el conteo de clientes y rutinas recientes con información de clientes
        const [clientesResponse, rutinasResponse] = await Promise.all([
          api.get('/miembros'),
          api.get('/rutinas?limit=4&sort=fecha_asignacion:desc&expand=cliente')
        ]);
        
        const todosLosMiembros = Array.isArray(clientesResponse.data) ? clientesResponse.data : [];
        
        // Procesar las rutinas recientes
        if (rutinasResponse.data && Array.isArray(rutinasResponse.data.rutinas)) {
          const actividades = await Promise.all(rutinasResponse.data.rutinas.map(async (rutina, index) => {
            let nombreCliente = 'Cliente';
            
            // Si el cliente está incluido en la respuesta
            if (rutina.cliente) {
              nombreCliente = rutina.cliente.nombre || rutina.cliente.nombre_usuario || 'Cliente';
            }
            // Si no, intentar obtener el cliente por ID
            else if (rutina.id_cliente) {
              try {
                const clienteResponse = await api.get(`/miembros/${rutina.id_cliente}`);
                if (clienteResponse.data) {
                  nombreCliente = clienteResponse.data.nombre || clienteResponse.data.nombre_usuario || 'Cliente';
                }
              } catch (error) {
                console.error('Error al cargar datos del cliente:', error);
              }
            }
            
            return {
              id: rutina.id || index,
              type: 'rutina',
              title: `Rutina asignada a ${nombreCliente}`,
              description: rutina.nombre || 'Nueva rutina de entrenamiento',
              time: new Date(rutina.fecha_asignacion || new Date()).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
              status: 'asignada',
              icon: <FaDumbbell />
            };
          }));
          
          setRecentActivities(actividades);
        }

        // Filtrar solo los clientes (rol_id = 3 según la base de datos)
        const clientes = todosLosMiembros.filter(miembro => miembro.rol_id === 3);
        const totalClientes = clientes.length;

        // Obtener clases de hoy basándose en los horarios
        let clasesHoy = 0;
        try {
          const clasesResponse = await api.get('/clases');
          const clases = Array.isArray(clasesResponse.data) ? clasesResponse.data : [];

          // Obtener el día de la semana actual
          const hoy = new Date();
          const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const diaActual = diasSemana[hoy.getDay()];

          // Filtrar clases que tienen horario para hoy Y pertenecen al entrenador logueado
          clasesHoy = clases.filter(clase => {
            if (!clase.horario || clase.horario.trim() === '') return false;

            const horarioLower = clase.horario.toLowerCase();
            const tieneHorarioParaHoy = horarioLower.includes(diaActual.toLowerCase());

            // Si no hay usuario logueado, mostrar solo las del Entrenador Principal (ID: 5)
            const perteneceAlEntrenador = !currentUser?.id ?
              clase.id_entrenador == 5 :
              clase.id_entrenador == currentUser?.id;

            return tieneHorarioParaHoy && perteneceAlEntrenador;
          }).length;

          console.log('Día actual:', diaActual);
          console.log('Usuario logueado:', currentUser);
          console.log('Clases encontradas para hoy:', clasesHoy);
          console.log('Todas las clases:', clases);
        } catch (error) {
          console.log('No se pudieron cargar las clases:', error);
        }

        // Obtener asistencias de hoy para miembros activos
        let asistenciasHoy = 0;
        let rutinasActivas = 0;

        try {
          const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
          console.log('Buscando asistencias para la fecha:', hoy);

          const asistenciasResponse = await api.get('/asistencias', {
            params: {
              fecha: hoy,
              _t: new Date().getTime() // Evitar caché
            }
          });

          console.log('Respuesta de asistencias:', asistenciasResponse);

          // Verificar la estructura de la respuesta
          let asistenciasHoyData = [];

          // Primero intentar con la estructura esperada (response.data.data)
          if (asistenciasResponse.data && Array.isArray(asistenciasResponse.data.data)) {
            asistenciasHoyData = asistenciasResponse.data.data;
          }
          // Si no, verificar si la respuesta es directamente un array
          else if (Array.isArray(asistenciasResponse.data)) {
            asistenciasHoyData = asistenciasResponse.data;
          }

          console.log('Datos de asistencias procesados:', asistenciasHoyData);

          const miembrosConAsistenciaHoy = new Set();

          asistenciasHoyData.forEach((asistencia, index) => {
            console.log(`Asistencia ${index + 1}:`, asistencia);
            if (asistencia && asistencia.miembro_id) {
              miembrosConAsistenciaHoy.add(asistencia.miembro_id);
            } else {
              console.warn('Asistencia sin miembro_id válido:', asistencia);
            }
          });

          asistenciasHoy = miembrosConAsistenciaHoy.size; // Contar miembros únicos
          console.log(`Resumen: ${asistenciasHoy} miembros únicos con asistencia hoy`);
          console.log('IDs de miembros con asistencia hoy:', Array.from(miembrosConAsistenciaHoy));

          // Obtener rutinas activas del entrenador actual
          try {
            console.log('Solicitando rutinas activas...');
            const rutinasResponse = await api.get('/rutinas', {
              params: {
                _t: new Date().getTime() // Evitar caché
              }
            });

            console.log('Respuesta de rutinas:', {
              status: rutinasResponse.status,
              headers: rutinasResponse.headers,
              data: rutinasResponse.data
            });

            if (rutinasResponse.data && Array.isArray(rutinasResponse.data.rutinas)) {
              const rutinas = rutinasResponse.data.rutinas;
              // Contar rutinas totales
              const totalRutinas = rutinas.length;

              // Contar asignaciones activas
              rutinasActivas = rutinas.reduce((total, rutina) => {
                const asignados = parseInt(rutina.clientes_asignados) || 0;
                console.log(`Rutina ${rutina.id} (${rutina.nombre}): ${asignados} clientes`);
                return total + asignados;
              }, 0);

              console.log('Total de rutinas:', totalRutinas);
              console.log('Total de asignaciones activas:', rutinasActivas);

              // Actualizar el estado con ambos valores
              setStats(prev => ({
                ...prev,
                totalRutinas,
                rutinasActivas
              }));
            } else {
              console.warn('La respuesta de rutinas no tiene el formato esperado:', rutinasResponse.data);
            }
          } catch (error) {
            console.error('Error al cargar rutinas activas:', {
              message: error.message,
              response: error.response ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
              } : 'No response',
              request: error.request ? 'Request was made but no response received' : 'No request was made',
              config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
              }
            });
            // Intentar con una ruta alternativa o valor por defecto
            rutinasActivas = 0;
          }
        } catch (error) {
          console.log('Error al cargar datos:', error);
        }

        setStats({
          totalClientes,
          clasesHoy,
          rutinasActivas,
          // Por ahora hardcodeado
        });

        console.log('Dashboard data loaded:', {
          totalClientes,
          clasesHoy,
          asistenciasHoy,
          todosLosMiembros: todosLosMiembros.length,
          clientesFiltrados: clientes.length,
          rolesEncontrados: [...new Set(todosLosMiembros.map(m => m.rol_id))]
        });

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        // En caso de error, mantener valores por defecto
        setStats({
          totalClientes: 0,
          clasesHoy: 0,
          rutinasActivas: 0,

        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCardClick = (route) => {
    navigate(route);
  };

  const dashboardCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: <FaUserFriends />,
      color: '#4e73df',
      route: '/entrenador/clientes',
      description: 'Clientes asignados'
    },
    {
      title: 'Clases Hoy',
      value: stats.clasesHoy,
      icon: <FaCalendarAlt />,
      color: '#1cc88a',
      route: '/entrenador/clases',
      description: 'Sesiones programadas'
    },

  ];

  // Las actividades recientes ahora se cargan desde la API en el useEffect

  const upcomingClasses = [
    {
      id: 1,
      name: 'Yoga Flow',
      time: '14:00 - 15:00',
      clients: 8,
      maxClients: 12
    },
    {
      id: 2,
      name: 'CrossFit',
      time: '16:00 - 17:00',
      clients: 6,
      maxClients: 10
    },
    {
      id: 3,
      name: 'Pilates',
      time: '18:00 - 19:00',
      clients: 10,
      maxClients: 10
    }
  ];

  return (
    <div className="entrenador-dashboard-content">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Inicio</h1>
          <p>Bienvenido de vuelta, {currentUser?.nombre || 'Entrenador'}</p>
        </div>
        <div className="quick-actions">
          <button
            className="action-btn"
            onClick={() => navigate('/entrenador/rutinas')}
          >
            <FaClipboardList />
            <span>Nueva Rutina</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="admin-cards">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="admin-card"
            style={{ borderLeftColor: card.color }}
            onClick={() => handleCardClick(card.route)}
          >
            <div className="card-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <div className="card-value">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  card.value
                )}
              </div>
              <p className="card-description">{card.description}</p>
              <div className="card-btn">
                Ver detalles <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido Principal */}
      <div className="dashboard-main-content">
        {/* Actividades Recientes */}
        <div className="admin-panel">
          <h3 className="panel-title">
            <FaClock /> Actividades Recientes
          </h3>
          <div className="activities-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" style={{ color: '#4e73df' }}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    {activity.description && <p className="activity-description">{activity.description}</p>}
                    <p className="activity-time">{activity.time}</p>
                  </div>
                  <div className={`activity-status ${activity.status}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities">
                <p>No hay actividades recientes para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* Próximas Clases */}
        <div className="admin-panel">
          <h3 className="panel-title">
            <FaCalendarAlt /> Próximas Clases
          </h3>
          <div className="classes-list">
            {upcomingClasses.map((clase) => (
              <div key={clase.id} className="class-item">
                <div className="class-info">
                  <h4>{clase.name}</h4>
                  <p>{clase.time}</p>
                </div>
                <div className="class-attendance">
                  <span className="attendance-count">
                    {clase.clients}/{clase.maxClients}
                  </span>
                  <div className="attendance-bar">
                    <div
                      className="attendance-fill"
                      style={{ width: `${(clase.clients / clase.maxClients) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrenadorDashboard;