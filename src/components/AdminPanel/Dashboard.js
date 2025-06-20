import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClientes } from '../../services/clientesService';
import { getClases } from '../../services/clasesService';
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

const Dashboard = () => {
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

  useEffect(() => {
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
  }, []);

  const formatMonthYear = () => {
    return format(new Date(), 'MMMM yyyy', { locale: es });
  };

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
            <span className="card-title">Ingresos de {formatMonthYear()}</span>
            <span className="card-value">{formatCurrency(stats.monthlyIncome)}</span>
            <Link to="/ventas-finanzas" className="card-btn">Ver Finanzas →</Link>
          </div>
        </div>
      </div>
      {/* Dashboard panels */}
      <div className="admin-panels">
        <div className="admin-panel">
          <div className="panel-title"><span role="img" aria-label="asistencia">📈</span> Asistencia Mensual</div>
          <div className="panel-content">
            <p>Gráfica de asistencia mensual se mostrará aquí</p>
          </div>
        </div>
        <div className="admin-panel">
          <div className="panel-title"><span role="img" aria-label="populares">📊</span> Clases más Populares</div>
          <div className="panel-content">
            <p>Lista de clases más populares se mostrará aquí</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
