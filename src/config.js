// Configuración de la API
const API_CONFIG = {
  // Usamos la URL base desde la variable de entorno
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3307/api',
  
  // Configuración de axios
  TIMEOUT: 10000, // 10 segundos
  WITH_CREDENTIALS: true
};

export default API_CONFIG;
