import api from './api';

export const getFacturas = async () => {
  const { data } = await api.get('/facturas');
  return data;
};

export const getFactura = async (id) => {
  const { data } = await api.get(`/facturas/${id}`);
  return data;
};

export const crearFactura = async (factura) => {
  const { data } = await api.post('/facturas', factura);
  return data;
};

export const actualizarFactura = async (id, factura) => {
  const { data } = await api.put(`/facturas/${id}`, factura);
  return data;
};

export const eliminarFactura = async (id) => {
  const { data } = await api.delete(`/facturas/${id}`);
  return data;
};
