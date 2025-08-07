import api from './api';

// Constantes
export const NIVELES = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
];

export const OBJETIVOS = [
  { value: 'perdida_peso', label: 'Pérdida de Peso' },
  { value: 'ganancia_muscular', label: 'Ganancia Muscular' },
  { value: 'resistencia', label: 'Resistencia' },
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'salud_general', label: 'Salud General' }
];

export const TIPOS_EJERCICIO = [
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'equilibrio', label: 'Equilibrio' },
  { value: 'funcional', label: 'Funcional' }
];

export const ESTADOS_RUTINA = [
  { value: 'activa', label: 'Activa' },
  { value: 'pausada', label: 'Pausada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' }
];

// Obtener todas las categorías de ejercicios
export const getCategoriasEjercicios = async () => {
  try {
    const response = await api.get('/categorias-ejercicios');
    return response.data.categorias;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

// Obtener todos los ejercicios
export const getEjercicios = async () => {
  try {
    const response = await api.get('/ejercicios');
    return response.data.ejercicios;
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    throw error;
  }
};

// Obtener ejercicios por categoría
export const getEjerciciosPorCategoria = async (categoriaId) => {
  try {
    const response = await api.get(`/ejercicios/categoria/${categoriaId}`);
    return response.data.ejercicios;
  } catch (error) {
    console.error('Error al obtener ejercicios por categoría:', error);
    throw error;
  }
};

// Obtener todas las rutinas del entrenador
export const getRutinas = async () => {
  try {
    const response = await api.get('/rutinas');
    return response.data.rutinas;
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    throw error;
  }
};

// Obtener una rutina específica con sus días y ejercicios
export const getRutinaDetalle = async (rutinaId) => {
  try {
    const response = await api.get(`/rutinas/${rutinaId}`);
    return response.data.rutina;
  } catch (error) {
    console.error('Error al obtener detalle de rutina:', error);
    throw error;
  }
};

// Crear nueva rutina
export const createRutina = async (rutinaData) => {
  try {
    const response = await api.post('/rutinas', rutinaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear rutina:', error);
    throw error;
  }
};

// Actualizar rutina existente
export const updateRutina = async (rutinaId, rutinaData) => {
  try {
    const response = await api.put(`/rutinas/${rutinaId}`, rutinaData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    throw error;
  }
};

// Eliminar rutina
export const deleteRutina = async (rutinaId) => {
  try {
    const response = await api.delete(`/rutinas/${rutinaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    throw error;
  }
};

// Asignar rutina a cliente
export const asignarRutinaCliente = async (rutinaId, asignacionData) => {
  try {
    const response = await api.post(`/rutinas/${rutinaId}/asignar`, asignacionData);
    return response.data;
  } catch (error) {
    console.error('Error al asignar rutina:', error);
    throw error;
  }
};

// Obtener rutinas asignadas a un cliente
export const getRutinasCliente = async (clienteId) => {
  try {
    const response = await api.get(`/clientes/${clienteId}/rutinas`);
    return response.data.rutinas;
  } catch (error) {
    console.error('Error al obtener rutinas del cliente:', error);
    throw error;
  }
};

// Obtener clientes asignados a una rutina
export const getClientesAsignados = async (rutinaId) => {
  try {
    const response = await api.get(`/rutinas/${rutinaId}/clientes-asignados`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes asignados:', error);
    throw error;
  }
};

// Registrar progreso de ejercicio
export const registrarProgreso = async (progresoData) => {
  try {
    const response = await api.post('/progreso', progresoData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar progreso:', error);
    throw error;
  }
};

// Obtener marcas personales de un cliente
export const getMarcasCliente = async (clienteId) => {
  try {
    const response = await api.get(`/clientes/${clienteId}/marcas`);
    return response.data.marcas;
  } catch (error) {
    console.error('Error al obtener marcas del cliente:', error);
    throw error;
  }
};

// Obtener plantillas de rutinas
export const getPlantillasRutinas = async () => {
  try {
    const response = await api.get('/rutinas/plantillas');
    return response.data.plantillas;
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    throw error;
  }
};

// Pausar rutina de cliente
export const pausarRutinaCliente = async (rutinaClienteId) => {
  try {
    const response = await api.put(`/rutinas-clientes/${rutinaClienteId}/pausar`);
    return response.data;
  } catch (error) {
    console.error('Error al pausar rutina:', error);
    throw error;
  }
};

// Reactivar rutina de cliente
export const reactivarRutinaCliente = async (rutinaClienteId) => {
  try {
    const response = await api.put(`/rutinas-clientes/${rutinaClienteId}/reactivar`);
    return response.data;
  } catch (error) {
    console.error('Error al reactivar rutina:', error);
    throw error;
  }
};

// Enviar notificación al cliente
export const enviarNotificacionCliente = async (clienteId, notificacionData) => {
  try {
    const response = await api.post(`/clientes/${clienteId}/notificaciones`, notificacionData);
    return response.data;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
};

// Obtener estadísticas de rutinas
export const getEstadisticasRutinas = async () => {
  try {
    const response = await api.get('/rutinas/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// Duplicar rutina
export const duplicarRutina = async (rutinaId) => {
  try {
    const response = await api.post(`/rutinas/${rutinaId}/duplicar`);
    return response.data;
  } catch (error) {
    console.error('Error al duplicar rutina:', error);
    throw error;
  }
};

// Exportar rutina
export const exportarRutina = async (rutinaId, formato = 'json') => {
  try {
    const response = await api.get(`/rutinas/${rutinaId}/exportar?formato=${formato}`);
    return response.data;
  } catch (error) {
    console.error('Error al exportar rutina:', error);
    throw error;
  }
};

// Importar rutina
export const importarRutina = async (rutinaData) => {
  try {
    const response = await api.post('/rutinas/importar', rutinaData);
    return response.data;
  } catch (error) {
    console.error('Error al importar rutina:', error);
    throw error;
  }
};
