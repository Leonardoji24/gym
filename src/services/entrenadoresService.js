import axios from 'axios';
import API_CONFIG from '../config';

const API_URL = `${API_CONFIG.BASE_URL}/miembros`;

/**
 * Obtiene todos los entrenadores de la tabla 'miembros'
 * @returns {Promise<Array>} Lista de entrenadores
 */
export const getEntrenadores = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Filtrar solo los miembros con rol 'entrenador' y asegurar que tengan los campos necesarios
    const entrenadores = response.data
      .filter(miembro => {
        const nombreRol = miembro.rol_nombre || '';
        return nombreRol.toLowerCase() === 'entrenador';
      })
      .map(entrenador => ({
        id_miembro: entrenador.id_miembro || entrenador.id,
        nombre: entrenador.nombre || '',
        apellido: entrenador.apellido || '',
        email: entrenador.email || '',
        telefono: entrenador.telefono || '',
        fecha_registro: entrenador.fecha_registro || new Date().toISOString().split('T')[0]
      }));
      
    console.log('Entrenadores cargados:', entrenadores);
    return entrenadores;
  } catch (error) {
    console.error('Error al obtener los entrenadores:', error);
    throw error;
  }
};

/**
 * Crea un nuevo entrenador en la tabla 'miembros'
 * @param {Object} entrenadorData - Datos del entrenador a crear
 * @returns {Promise<Object>} Respuesta del servidor con los datos del entrenador creado
 */
export const createEntrenador = async (entrenadorData) => {
  try {
    // Forzar el rol a 'entrenador'
    const dataWithRole = { ...entrenadorData, rol: 'entrenador' };
    const response = await axios.post(API_URL, dataWithRole, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear el entrenador:', error);
    throw error;
  }
};

/**
 * Actualiza un entrenador existente en la tabla 'miembros'
 * @param {number} id - ID del entrenador a actualizar
 * @param {Object} entrenadorData - Nuevos datos del entrenador
 * @returns {Promise<Object>} Respuesta del servidor con los datos actualizados
 */
export const updateEntrenador = async (id, entrenadorData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, entrenadorData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el entrenador:', error);
    throw error;
  }
};

/**
 * Elimina un entrenador de la tabla 'miembros'
 * @param {number} id - ID del entrenador a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteEntrenador = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el entrenador:', error);
    throw error;
  }
};
