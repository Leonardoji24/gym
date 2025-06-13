import axios from 'axios';
import API_CONFIG from '../config';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
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

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
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
