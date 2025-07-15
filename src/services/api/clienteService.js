import api from './api';

const clienteService = {
  // Get all clients
  async getClientes() {
    try {
      const response = await api.get('/api/clientes');
      return response.data;
    } catch (error) {
      console.error('Error fetching clientes:', error);
      throw error;
    }
  },

  // Get a single client by ID
  async getClienteById(id) {
    try {
      const response = await api.get(`/api/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cliente with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new client
  async createCliente(clienteData) {
    try {
      const response = await api.post('/api/clientes', clienteData);
      return response.data;
    } catch (error) {
      console.error('Error creating cliente:', error);
      throw error;
    }
  },

  // Update an existing client
  async updateCliente(id, clienteData) {
    try {
      const response = await api.put(`/api/clientes/${id}`, clienteData);
      return response.data;
    } catch (error) {
      console.error(`Error updating cliente with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a client
  async deleteCliente(id) {
    try {
      const response = await api.delete(`/api/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting cliente with ID ${id}:`, error);
      throw error;
    }
  },

  // Get client's membership status
  async getMembresiaStatus(id) {
    try {
      const response = await api.get(`/api/clientes/${id}/membresia`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching membresia status for cliente ${id}:`, error);
      throw error;
    }
  },

  // Update client's membership
  async updateMembresia(id, membresiaData) {
    try {
      const response = await api.put(`/api/clientes/${id}/membresia`, membresiaData);
      return response.data;
    } catch (error) {
      console.error(`Error updating membresia for cliente ${id}:`, error);
      throw error;
    }
  },

  // Search clients
  async searchClientes(query) {
    try {
      const response = await api.get('/api/clientes/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching clientes:', error);
      throw error;
    }
  },

  // Get upcoming expirations
  async getProximosVencimientos(days = 30) {
    try {
      const response = await api.get('/api/clientes/proximos-vencimientos', { 
        params: { days } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching proximos vencimientos:', error);
      throw error;
    }
  },

  // Get client statistics
  async getEstadisticas() {
    try {
      const response = await api.get('/api/clientes/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error fetching clientes estadisticas:', error);
      throw error;
    }
  }
};

export default clienteService;
