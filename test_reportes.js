const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@gym.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Error al obtener token:', error.response?.data || error.message);
    return null;
  }
}

// Función para probar endpoint de reporte de asistencia
async function testReporteAsistencia(token) {
  try {
    console.log('\n=== Probando Reporte de Asistencia ===');
    const response = await axios.get(`${API_BASE_URL}/api/reportes/asistencia?rango=semana`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reporte de asistencia exitoso');
    console.log('Datos del gráfico:', response.data.datos_grafico?.length || 0, 'días');
    console.log('Estadísticas:', response.data.estadisticas);
  } catch (error) {
    console.error('❌ Error en reporte de asistencia:', error.response?.data || error.message);
  }
}

// Función para probar endpoint de reporte de rutinas
async function testReporteRutinas(token) {
  try {
    console.log('\n=== Probando Reporte de Rutinas ===');
    const response = await axios.get(`${API_BASE_URL}/api/reportes/rutinas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reporte de rutinas exitoso');
    console.log('Rutinas por nivel:', response.data.rutinas_por_nivel?.length || 0);
    console.log('Top rutinas:', response.data.top_rutinas?.length || 0);
    console.log('Estadísticas:', response.data.estadisticas);
  } catch (error) {
    console.error('❌ Error en reporte de rutinas:', error.response?.data || error.message);
  }
}

// Función para probar endpoint de reporte de clientes
async function testReporteClientes(token) {
  try {
    console.log('\n=== Probando Reporte de Clientes ===');
    const response = await axios.get(`${API_BASE_URL}/api/reportes/clientes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reporte de clientes exitoso');
    console.log('Clientes por estado:', response.data.clientes_por_estado?.length || 0);
    console.log('Clientes con rutinas:', response.data.clientes_con_rutinas?.length || 0);
    console.log('Estadísticas:', response.data.estadisticas);
  } catch (error) {
    console.error('❌ Error en reporte de clientes:', error.response?.data || error.message);
  }
}

// Función para probar endpoint de reporte de progreso
async function testReporteProgreso(token) {
  try {
    console.log('\n=== Probando Reporte de Progreso ===');
    const response = await axios.get(`${API_BASE_URL}/api/reportes/progreso`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reporte de progreso exitoso');
    console.log('Progreso de clientes:', response.data.progreso_clientes?.length || 0);
    console.log('Marcas recientes:', response.data.marcas_recientes?.length || 0);
    console.log('Estadísticas de progreso:', response.data.estadisticas_progreso);
  } catch (error) {
    console.error('❌ Error en reporte de progreso:', error.response?.data || error.message);
  }
}

// Función principal
async function testAllReportes() {
  console.log('🚀 Iniciando pruebas de reportes...');
  
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ No se pudo obtener el token de autenticación');
    return;
  }
  
  console.log('✅ Token obtenido correctamente');
  
  await testReporteAsistencia(token);
  await testReporteRutinas(token);
  await testReporteClientes(token);
  await testReporteProgreso(token);
  
  console.log('\n🎉 Pruebas completadas');
}

// Ejecutar pruebas
testAllReportes().catch(console.error);
