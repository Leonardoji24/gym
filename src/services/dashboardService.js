import api from './api';

const dashboardService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  
  async getActiveClientsCount() {
    try {
      // Primero intentamos con el endpoint de conteo
      try {
        const response = await api.get('/miembros/count?rol=cliente');
        return response.data.count || 0;
      } catch (apiError) {
        console.log('Endpoint de conteo no disponible, contando localmente...');
        // Si falla, obtenemos todos los clientes y contamos localmente
        const response = await api.get('/miembros');
        const clientes = Array.isArray(response.data) ? 
          response.data.filter(miembro => 
            String(miembro.rol || '').toLowerCase() === 'cliente'
          ) : [];
        return clientes.length;
      }
    } catch (error) {
      console.error('Error contando clientes:', error);
      return 0;
    }
  },
  
  async getTrainersCount() {
    try {
      // Primero intentamos con el endpoint de conteo
      try {
        const response = await api.get('/miembros/count?rol=entrenador');
        return response.data.count || 0;
      } catch (apiError) {
        console.log('Endpoint de conteo no disponible, contando localmente...');
        // Si falla, obtenemos todos los entrenadores y contamos localmente
        const response = await api.get('/miembros');
        const entrenadores = Array.isArray(response.data) ? 
          response.data.filter(miembro => 
            String(miembro.rol || '').toLowerCase() === 'entrenador'
          ) : [];
        return entrenadores.length;
      }
    } catch (error) {
      console.error('Error contando entrenadores:', error);
      return 0;
    }
  },
  
  async getActiveClassesCount() {
    try {
      const response = await api.get('/clases/count?estado=activo');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching active classes count:', error);
      return 0;
    }
  },
  
  async getMonthlyIncome() {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const response = await api.get(`/pagos/mensual?inicio=${firstDay}&fin=${lastDay}`);
      return response.data.total || 0;
    } catch (error) {
      console.error('Error fetching monthly income:', error);
      return 0;
    }
  }
};

export default dashboardService;
