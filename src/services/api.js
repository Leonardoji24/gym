import axios from 'axios';
import API_CONFIG from '../config';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL, // El /api ya está incluido en las rutas del backend
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Añadir logs para depuración
api.interceptors.request.use(
  config => {
    if (API_CONFIG.DEBUG) {
      console.log('Enviando solicitud a:', config.url);
      console.log('Método:', config.method);
      console.log('Headers:', config.headers);
    }
    return config;
  },
  error => {
    if (API_CONFIG.DEBUG) {
      console.error('Error en la solicitud:', error);
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    if (API_CONFIG.DEBUG) {
      console.log('Respuesta recibida:', response.status, response.data);
    }
    return response;
  },
  error => {
    if (API_CONFIG.DEBUG) {
      console.error('Error en la respuesta:', error);
      if (error.response) {
        console.error('Datos del error:', error.response.data);
        console.error('Status del error:', error.response.status);
        console.error('Headers de la respuesta:', error.response.headers);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

// Asegurarse de que no haya doble barra en las URLs
api.interceptors.request.use(config => {
  if (config.url) {
    config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
  }
  return config;
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expirado o no válido
      if (error.response.status === 401) {
        // Limpiar el token expirado
        localStorage.removeItem('token');
        // Redirigir al login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;

    // Guardar el token en localStorage
    localStorage.setItem('token', token);

    // Mapear los roles del backend a los roles del frontend
    const roleMap = {
      'admin': 'admin',
      'entrenador': 'trainer',
      'cliente': 'client'
    };

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: roleMap[user.rol_nombre] || 'client',
      token
    };
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    const user = response.data;

    // Mapear los roles del backend a los roles del frontend
    const roleMap = {
      'admin': 'admin',
      'entrenador': 'trainer',
      'cliente': 'client'
    };

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: roleMap[user.rol_nombre] || 'client'
    };
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout del servidor:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },
};

// Servicios de miembros
export const memberService = {
  getMembers: async () => {
    const response = await api.get('/members');
    return response.data;
  },
  createMember: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },
};

// Servicios de asistencias
export const attendanceService = {
  getAttendances: async () => {
    const response = await api.get('/asistencias');
    return response.data;
  },
  registerEntry: async (memberId) => {
    const response = await api.post('/asistencias/entrada', { memberId });
    return response.data;
  },
  registerExit: async (attendanceId) => {
    const response = await api.put(`/asistencias/salida/${attendanceId}`);
    return response.data;
  },
};

export default api;
