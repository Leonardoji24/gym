import api from './api';

// Obtener todos los miembros
export const getMiembros = async () => {
  try {
    const response = await api.get('/miembros');
    return response.data.miembros;
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    throw error;
  }
};

// Obtener miembros activos
export const getMiembrosActivos = async () => {
  try {
    const response = await api.get('/miembros/activos');
    return response.data.miembros;
  } catch (error) {
    console.error('Error al obtener miembros activos:', error);
    throw error;
  }
};

// Obtener un miembro específico
export const getMiembro = async (miembroId) => {
  try {
    const response = await api.get(`/miembros/${miembroId}`);
    return response.data.miembro;
  } catch (error) {
    console.error('Error al obtener miembro:', error);
    throw error;
  }
};

// Crear nuevo miembro
export const createMiembro = async (miembroData) => {
  try {
    const response = await api.post('/miembros', miembroData);
    return response.data;
  } catch (error) {
    console.error('Error al crear miembro:', error);
    throw error;
  }
};

// Actualizar miembro
export const updateMiembro = async (miembroId, miembroData) => {
  try {
    const response = await api.put(`/miembros/${miembroId}`, miembroData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar miembro:', error);
    throw error;
  }
};

// Eliminar miembro
export const deleteMiembro = async (miembroId) => {
  try {
    const response = await api.delete(`/miembros/${miembroId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    throw error;
  }
};

// Obtener miembros próximos a vencer
export const getMiembrosProximosAVencer = async () => {
  try {
    const response = await api.get('/miembros/proximos_a_vencer');
    return response.data.miembros;
  } catch (error) {
    console.error('Error al obtener miembros próximos a vencer:', error);
    throw error;
  }
};

// Buscar miembros por nombre o email
export const buscarMiembros = async (termino) => {
  try {
    const response = await api.get(`/miembros/buscar?q=${termino}`);
    return response.data.miembros;
  } catch (error) {
    console.error('Error al buscar miembros:', error);
    throw error;
  }
};

// Obtener estadísticas de miembros
export const getEstadisticasMiembros = async () => {
  try {
    const response = await api.get('/miembros/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de miembros:', error);
    throw error;
  }
};





