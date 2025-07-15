import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../../../../services/clientesService';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const navigate = useNavigate();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los clientes. Por favor, inténtalo de nuevo.');
      showSnackbar('Error al cargar los clientes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleCreate = async (clienteData) => {
    try {
      setLoading(true);
      await createCliente(clienteData);
      await fetchClientes();
      showSnackbar('Cliente creado exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      showSnackbar('Error al crear el cliente', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, clienteData) => {
    try {
      setLoading(true);
      await updateCliente(id, clienteData);
      await fetchClientes();
      showSnackbar('Cliente actualizado exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      showSnackbar('Error al actualizar el cliente', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteCliente(id);
      await fetchClientes();
      showSnackbar('Cliente eliminado exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      showSnackbar('Error al eliminar el cliente', 'error');
      return false;
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditClick = (cliente) => {
    setSelectedCliente(cliente);
    setIsFormOpen(true);
  };

  const handleViewClick = (cliente) => {
    setSelectedCliente(cliente);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = !!selectedCliente;
    let success = false;

    if (isEdit) {
      success = await handleUpdate(selectedCliente.id, formData);
    } else {
      success = await handleCreate(formData);
    }

    if (success) {
      setIsFormOpen(false);
      setSelectedCliente(null);
    }

    return success;
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCliente(null);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedCliente(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleConfirmDelete = () => {
    if (selectedCliente) {
      handleDelete(selectedCliente.id);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    // State
    clientes,
    loading,
    error,
    selectedCliente,
    isFormOpen,
    isViewOpen,
    isDeleteDialogOpen,
    snackbar,
    
    // Handlers
    handleEditClick,
    handleViewClick,
    handleDeleteClick,
    handleFormSubmit,
    handleCloseForm,
    handleCloseView,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    handleCloseSnackbar,
    refreshClientes: fetchClientes,
    
    // UI State Setters
    setIsFormOpen,
    setSelectedCliente,
  };
};

export default useClientes;
