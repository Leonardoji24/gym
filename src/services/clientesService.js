import axios from 'axios';
import API_CONFIG from '../config';

const API_URL = `${API_CONFIG.BASE_URL}/miembros`;

/**
 * Obtiene todos los miembros con un rol específico de la tabla 'miembros'
 * @param {string} [rol='cliente'] - Rol por el cual filtrar los miembros
 * @returns {Promise<Array>} Lista de miembros que coinciden con el rol especificado
 */
export const getClientes = async (rol = 'cliente', entrenadorId = null) => {
  try {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    // Configuración de la petición
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    };

    // Si se especifica un entrenadorId, obtenemos solo los clientes asignados a ese entrenador
    if (entrenadorId) {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/miembros/entrenador/${entrenadorId}`, config);
      return response.data;
    }
    
    // Si no se especifica entrenadorId, obtenemos todos los clientes
    const response = await axios.get(API_URL, config);
    
    // Si no se especifica un rol, devolvemos todos los miembros
    if (!rol) {
      return response.data;
    }
    
    // Filtrar miembros por el rol especificado (insensible a mayúsculas/minúsculas)
    const miembrosFiltrados = response.data.filter(miembro => {
      const nombreRol = miembro.rol_nombre || 'cliente';
      return nombreRol.toLowerCase() === rol.toLowerCase();
    });
    
    return miembrosFiltrados;
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    throw error;
  }
};

/**
 * Crea un nuevo miembro en la tabla 'miembros'
 * @param {Object} miembroData - Datos del miembro a crear
 * @returns {Promise<Object>} Respuesta del servidor con los datos del miembro creado
 */
export const createCliente = async (miembroData) => {
  try {
    const response = await axios.post(API_URL, miembroData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    throw error;
  }
};

/**
 * Actualiza un miembro existente en la tabla 'miembros'
 * @param {number} id - ID del miembro a actualizar
 * @param {Object} miembroData - Nuevos datos del miembro
 * @returns {Promise<Object>} Respuesta del servidor con los datos actualizados
 */
export const updateCliente = async (id, miembroData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, miembroData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    throw error;
  }
};

/**
 * Elimina un miembro de la tabla 'miembros'
 * @param {number} id - ID del miembro a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteCliente = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    throw error;
  }
};
