import axios from 'axios';
import API_CONFIG from '../config';

const API_URL = `${API_CONFIG.BASE_URL}/clases`;

/**
 * Obtiene todas las clases
 * @returns {Promise<Array>} Lista de clases
 */
export const getClases = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error al obtener las clases:', error);
    return [];
  }
};

/**
 * Crea una nueva clase
 * @param {Object} claseData - Datos de la clase a crear
 * @returns {Promise<Object>} Respuesta del servidor con los datos de la clase creada
 */
export const createClase = async (claseData) => {
  try {
    const response = await axios.post(API_URL, claseData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear la clase:', error);
    throw error;
  }
};

/**
 * Actualiza una clase existente
 * @param {number} id - ID de la clase a actualizar
 * @param {Object} claseData - Nuevos datos de la clase
 * @returns {Promise<Object>} Respuesta del servidor con los datos actualizados
 */
export const updateClase = async (id, claseData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, claseData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la clase:', error);
    throw error;
  }
};

/**
 * Elimina una clase
 * @param {number} id - ID de la clase a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteClase = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la clase:', error);
    throw error;
  }
};
