import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClientes } from '../../services/clientesService';
import { getClases, getClasesPopulares } from '../../services/clasesService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Dashboard.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Estilos para las celdas de la tabla
const tableHeaderStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  color: '#4b5563',
  fontSize: '0.8rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px 8px 0 0',
  border: 'none'
};

const tableCellStyle = {
  padding: '14px 16px',
  borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'middle',
  transition: 'all 0.2s ease',
  borderLeft: '4px solid transparent'
};

const Dashboard = () => {
  const [expiringMembers, setExpiringMembers] = useState([]);
  const [expiringLoading, setExpiringLoading] = useState(true);
  const [expiringError, setExpiringError] = useState(null);
  const [stats, setStats] = useState({
    trainers: 0,
    activeClasses: 0,
    monthlyIncome: 0,
    loading: true,
    error: null
  });
  const [clientes, setClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [entrenadores, setEntrenadores] = useState([]);
  const [entrenadoresLoading, setEntrenadoresLoading] = useState(true);
  const [clases, setClases] = useState([]);
  const [clasesLoading, setClasesLoading] = useState(true);
  const [clasesPopulares, setClasesPopulares] = useState([]);
  const [clasesPopularesLoading, setClasesPopularesLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringMembers = async () => {
      setExpiringLoading(true);
      setExpiringError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/miembros/proximos_a_vencer', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Error al obtener miembros próximos a vencer');
        const data = await res.json();
        setExpiringMembers(data.miembros || []);
      } catch (err) {
        setExpiringError('No se pudo cargar la información de membresías próximas a vencer');
        setExpiringMembers([]);
      } finally {
        setExpiringLoading(false);
      }
    };

    fetchExpiringMembers();
    const fetchDashboardData = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        const income = 0; // Puedes restaurar lógica de ingresos si lo necesitas
        setStats(prev => ({
          ...prev,
          monthlyIncome: income,
          loading: false,
          error: null
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard'
        }));
      }
    };

    const fetchClientes = async () => {
      try {
        setClientesLoading(true);
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        setClientes([]);
      } finally {
        setClientesLoading(false);
      }
    };

    const fetchEntrenadores = async () => {
      try {
        setEntrenadoresLoading(true);
        const data = await getClientes('entrenador');
        setEntrenadores(data);
        setStats(prev => ({ ...prev, trainers: data.length }));
      } catch (err) {
        setEntrenadores([]);
        setStats(prev => ({ ...prev, trainers: 0 }));
      } finally {
        setEntrenadoresLoading(false);
      }
    };

    const fetchClases = async () => {
      try {
        setClasesLoading(true);
        const data = await getClases();
        setClases(data);
        setStats(prev => ({ ...prev, activeClasses: data.length }));
      } catch (err) {
        setClases([]);
        setStats(prev => ({ ...prev, activeClasses: 0 }));
      } finally {
        setClasesLoading(false);
      }
    };

    fetchDashboardData();
    fetchClientes();
    fetchEntrenadores();
    fetchClases();

    // Obtener clases populares
    const fetchClasesPopulares = async () => {
      try {
        setClasesPopularesLoading(true);
        const data = await getClasesPopulares(5); // Obtener las 5 clases más populares
        setClasesPopulares(data);
      } catch (err) {
        console.error('Error al obtener clases populares:', err);
        setClasesPopulares([]);
      } finally {
        setClasesPopularesLoading(false);
      }
    };

    fetchClasesPopulares();
  }, []);

  if (stats.loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando datos del dashboard...</p>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="error-message">
        <p>{stats.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-btn"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard summary cards */}
      <div className="admin-dashboard">
        <div className="admin-cards">
          <div className="admin-card clients">
            <span className="card-icon"><i className="bi bi-people-fill"></i></span>
            <span className="card-title">Total de Clientes</span>
            <span className="card-value">{clientesLoading ? '...' : clientes.length}</span>
            <Link to="/clientes" className="card-btn">Ver Clientes →</Link>
          </div>
          <div className="admin-card trainers">
            <span className="card-icon"><i className="bi bi-person-badge"></i></span>
            <span className="card-title">Entrenadores</span>
            <span className="card-value">{entrenadoresLoading ? '...' : entrenadores.length}</span>
            <Link to="/entrenadores" className="card-btn">Ver Entrenadores →</Link>
          </div>
          <div className="admin-card classes">
            <span className="card-icon"><i className="bi bi-calendar-event"></i></span>
            <span className="card-title">Clases Activas</span>
            <span className="card-value">{clasesLoading ? '...' : clases.length}</span>
            <Link to="/clases" className="card-btn">Ver Clases →</Link>
          </div>
          <div className="admin-card income">
            <span className="card-icon"><i className="bi bi-cash-coin"></i></span>
            <span className="card-title">Ingresos</span>
            <span className="card-value">{formatCurrency(stats.monthlyIncome)}</span>
            <Link to="/ventas-finanzas" className="card-btn">Ver Finanzas →</Link>
          </div>
        </div>
      </div>
      {/* Dashboard panels */}
      <div className="admin-panels">
        {/* Panel de Lista de Clases */}
        <div className="admin-panel" style={{
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          <div className="panel-title" style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            <span role="img" aria-label="clases" style={{ marginRight: '10px' }}>📚</span> Lista de Clases
          </div>
          <div className="panel-content" style={{ padding: '0', overflowX: 'auto' }}>
            {clasesLoading ? (
              <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}>
                <i className="bi bi-arrow-repeat" style={{
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></i>
                <span>Cargando clases...</span>
              </div>
            ) : clases.length === 0 ? (
              <div style={{
                padding: '30px 20px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <i className="bi bi-emoji-frown" style={{
                  fontSize: '2rem',
                  marginBottom: '10px',
                  display: 'block',
                  opacity: '0.7'
                }}></i>
                <p style={{ margin: '5px 0' }}>No hay clases registradas</p>
                <small>Las clases aparecerán aquí cuando se hayan creado</small>
              </div>
            ) : (
              <>
                <table style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <th style={{...tableHeaderStyle, width: '60%'}}>Clase</th>
                      <th style={{...tableHeaderStyle, width: '40%'}}>Entrenador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clases.map((clase, index) => (
                      <tr 
                        key={clase.id} 
                        style={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            '& td': {
                              backgroundColor: '#f8fafc',
                              transform: 'translateX(2px)'
                            }
                          }
                        }}
                      >
                        <td style={{
                          ...tableCellStyle,
                          borderLeftColor: `hsl(${index * 60}, 70%, 60%)`,
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                              flexShrink: 0,
                              boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                            }}></div>
                            <div style={{
                              fontWeight: '500',
                              color: '#1e293b',
                              fontSize: '0.95rem'
                            }}>
                              {clase.nombre}
                            </div>
                          </div>
                        </td>
                        <td style={{
                          ...tableCellStyle,
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#4b5563',
                            fontSize: '0.92rem',
                            fontWeight: '500'
                          }}>
                            <i className="bi bi-person" style={{
                              color: '#94a3b8',
                              fontSize: '0.9em'
                            }}></i>
                            <span>{clase.nombre_entrenador || 'Sin asignar'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Estilos para las celdas de la tabla */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>


        <div className="admin-panel">
          <div className="panel-title"><span role="img" aria-label="vencer">⏰</span> Membresías próximas a vencer</div>
          <div className="panel-content" style={{ flexDirection: 'column', width: '100%' }}>
            {expiringLoading ? (
              <span>Cargando...</span>
            ) : expiringError ? (
              <span style={{ color: 'red' }}>{expiringError}</span>
            ) : expiringMembers.length === 0 ? (
              <span>No hay membresías próximas a vencer</span>
            ) : (
              <table style={{ width: '100%', fontSize: '0.98rem' }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>

                  </tr>
                </thead>
                <tbody>
                  {expiringMembers.map(m => {
                    let bg = '';
                    if (m.fecha_vencimiento_membresia) {
                      const hoy = new Date();
                      const vencimiento = new Date(m.fecha_vencimiento_membresia);
                      const diff = (vencimiento - hoy) / (1000 * 60 * 60 * 24);
                      if (diff < 0) bg = '#f8d7da'; // rojo si ya venció
                      else if (diff <= 10) bg = '#fff3cd'; // amarillo si vence en <= 3 días
                    }
                    return (
                      <tr key={m.id} style={{ backgroundColor: bg }}>
                        <td>{m.nombre}</td>
                        <td>{m.email}</td>
                        <td>{m.fecha_vencimiento_membresia ? new Date(m.fecha_vencimiento_membresia).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
