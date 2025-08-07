const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testRutinasAuth() {
  try {
    console.log('Probando autenticación y endpoint de rutinas...');
    
    // 1. Intentar login
    console.log('\n1. Intentando login...');
    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      { 
        username: 'admin@gym.com', 
        password: 'admin' 
      },
      { timeout: 5000 }
    );
    
    console.log('Login exitoso:', loginResponse.status);
    const token = loginResponse.data.token;
    console.log('Token obtenido:', token ? 'SÍ' : 'NO');
    
    // 2. Probar endpoint de rutinas con token
    console.log('\n2. Probando endpoint de rutinas con token...');
    const rutinasResponse = await axios.get(
      `${API_URL}/rutinas`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    console.log('Rutinas obtenidas:', rutinasResponse.status);
    console.log('Número de rutinas:', rutinasResponse.data.rutinas?.length || 0);
    
    // 3. Probar detalle de una rutina específica
    if (rutinasResponse.data.rutinas && rutinasResponse.data.rutinas.length > 0) {
      const primeraRutina = rutinasResponse.data.rutinas[0];
      console.log('\n3. Probando detalle de rutina:', primeraRutina.id);
      
      const detalleResponse = await axios.get(
        `${API_URL}/rutinas/${primeraRutina.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('Detalle de rutina obtenido:', detalleResponse.status);
      console.log('Días en la rutina:', detalleResponse.data.rutina?.dias?.length || 0);
    }
    
    // 4. Probar categorías de ejercicios
    console.log('\n4. Probando categorías de ejercicios...');
    const categoriasResponse = await axios.get(
      `${API_URL}/categorias-ejercicios`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    console.log('Categorías obtenidas:', categoriasResponse.status);
    console.log('Número de categorías:', categoriasResponse.data.categorias?.length || 0);
    
  } catch (error) {
    console.error('\nError en la prueba:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
  }
}

testRutinasAuth();
