const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testConnection() {
  try {
    console.log('Probando conexión al backend...');
    
    // 1. Probar la ruta raíz
    console.log('\n1. Probando ruta raíz...');
    const rootResponse = await axios.get(`${API_URL}/`, { timeout: 5000 });
    console.log('Respuesta de la ruta raíz:', rootResponse.status, rootResponse.statusText);
    
    // 2. Probar autenticación
    console.log('\n2. Probando autenticación...');
    try {
      const authResponse = await axios.post(
        `${API_URL}/login`,
        { username: 'admin', password: 'admin' },
        { timeout: 5000 }
      );
      console.log('Respuesta de autenticación:', authResponse.status, authResponse.statusText);
    } catch (authError) {
      console.log('Error en autenticación (esperado si no hay credenciales válidas):', authError.response?.status || authError.code);
    }
    
    // 3. Probar endpoint de asistencias
    console.log('\n3. Probando endpoint de asistencias...');
    try {
      const asistenciaResponse = await axios.post(
        `${API_URL}/asistencias/registrar`,
        { miembro_id: 1, clase_id: 1 },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 
        }
      );
      console.log('Respuesta del endpoint de asistencias:', asistenciaResponse.status, asistenciaResponse.statusText);
    } catch (asistenciaError) {
      if (asistenciaError.response) {
        console.log('Error en el endpoint de asistencias (esperado sin autenticación):', 
          asistenciaError.response.status, asistenciaError.response.statusText);
      } else {
        console.log('Error de conexión al endpoint de asistencias:', asistenciaError.code || asistenciaError.message);
      }
    }
    
  } catch (error) {
    console.error('\nError en la prueba de conexión:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
  }
}

testConnection();
