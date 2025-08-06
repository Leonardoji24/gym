import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Registra la asistencia de un miembro a una clase
 * @param {number} miembroId - ID del miembro que asiste
 * @param {number} claseId - ID de la clase a la que asiste
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const registrarAsistencia = async (miembroId, claseId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      throw new Error('No se encontró el token de autenticación');
    }

    console.log('Enviando solicitud de registro de asistencia a:', `${API_URL}/asistencias/registrar`);
    console.log('Datos:', { miembro_id: miembroId, clase_id: claseId });
    
    const response = await axios.post(
      `${API_URL}/asistencias/registrar`,
      { miembro_id: miembroId, clase_id: claseId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 10000 // 10 segundos de timeout
      }
    );
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error al registrar asistencia:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response from server',
      request: error.request ? 'Request was made but no response received' : 'No request was made',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      throw error.response.data || { 
        message: `Error del servidor: ${error.response.status} ${error.response.statusText}` 
      };
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      throw { message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.' };
    } else {
      // Algo pasó en la configuración de la petición que generó un error
      throw { message: `Error al configurar la petición: ${error.message}` };
    }
  }
};

/**
 * Obtiene el historial de asistencias de un miembro
 * @param {number} miembroId - ID del miembro
 * @returns {Promise<Array>} Lista de asistencias
 */
export const obtenerAsistenciasPorMiembro = async (miembroId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/asistencias/miembro/${miembroId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    throw error.response?.data || { message: 'Error al obtener el historial de asistencias' };
  }
};
