import api from './api';

// Obtener reporte de asistencia
export const getReporteAsistencia = async (rango = 'semana', fechaInicio = null, fechaFin = null) => {
  const params = new URLSearchParams();
  params.append('rango', rango);
  
  if (fechaInicio) params.append('fecha_inicio', fechaInicio);
  if (fechaFin) params.append('fecha_fin', fechaFin);
  
  const response = await api.get(`/reportes/asistencia?${params.toString()}`);
  return response.data;
};

// Obtener reporte de rutinas
export const getReporteRutinas = async () => {
  const response = await api.get('/reportes/rutinas');
  return response.data;
};

// Obtener reporte de clientes
export const getReporteClientes = async () => {
  const response = await api.get('/reportes/clientes');
  return response.data;
};

// Obtener reporte de progreso
export const getReporteProgreso = async () => {
  const response = await api.get('/reportes/progreso');
  return response.data;
};

// Obtener miembros activos (mantener compatibilidad)
export const getMiembrosActivos = async () => {
  const response = await api.get('/miembros/activos');
  return response.data.miembros_activos || [];
};

