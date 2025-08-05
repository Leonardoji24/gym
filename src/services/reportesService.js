import api from './api';

// Obtener miembros activos
export const getMiembrosActivos = async () => {
  const response = await api.get('/miembros/activos');
  return response.data.miembros_activos || [];
};

