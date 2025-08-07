// Configuración de la API
const API_CONFIG = {
  // Usar HTTP en desarrollo para evitar problemas con certificados
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Configuración de axios
  TIMEOUT: 30000, // 30 segundos de timeout
  WITH_CREDENTIALS: true, // Importante para enviar cookies
  
  // Configuración adicional para desarrollo
  DEBUG: process.env.NODE_ENV !== 'production'
};

// Configuración global para desarrollo
if (process.env.NODE_ENV !== 'production') {
  // Mostrar logs detallados en desarrollo
  console.log('Configuración de la API:', API_CONFIG);
}

export default API_CONFIG;
