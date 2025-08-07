const axios = require('axios');

async function testSimple() {
  try {
    console.log('Probando login...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@gym.com',
      password: 'admin123'
    });
    
    console.log('Login exitoso');
    const token = loginResponse.data.token;
    
    // Probar rutinas
    console.log('Probando rutinas...');
    const rutinasResponse = await axios.get('http://localhost:5000/api/rutinas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Rutinas obtenidas:', rutinasResponse.data);
    
    if (rutinasResponse.data.rutinas && rutinasResponse.data.rutinas.length > 0) {
      const primeraRutina = rutinasResponse.data.rutinas[0];
      console.log('Primera rutina:', primeraRutina);
      
      // Probar detalle de rutina
      console.log('Probando detalle de rutina...');
      const detalleResponse = await axios.get(`http://localhost:5000/api/rutinas/${primeraRutina.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Detalle de rutina:', detalleResponse.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSimple();
