import axios from 'axios';
import API_CONFIG from '../config';

const API_URL = `${API_CONFIG.BASE_URL}/inventario`;

export const getInventario = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
    return [];
  }
};

export const createInventario = async (itemData) => {
  try {
    const response = await axios.post(API_URL, itemData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear el recurso:', error);
    throw error;
  }
};

export const updateInventario = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el recurso:', error);
    throw error;
  }
};

export const deleteInventario = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el recurso:', error);
    throw error;
  }
};
