import api from './api';

// Servicio para obtener reportes de asistencias
export const getReporteAsistencias = async (filtros = {}) => {
  const params = new URLSearchParams(filtros).toString();
  const { data } = await api.get(`/reportes/asistencias?${params}`);
  return data;
};

// Puedes agregar más servicios para otros reportes (ingresos, membresías, etc.)
