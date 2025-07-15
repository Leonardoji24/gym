import React from 'react';
import { 
  Box, 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  DialogContentText
} from '@mui/material';
import useClientes from './hooks/useClientes';
import { ListaClientes, FormularioCliente, DetalleCliente } from './components';
import './Clientes.css';

const Clientes = () => {
  const {
    // State
    clientes,
    loading,
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
    refreshClientes
  } = useClientes();

  return (
    <Box sx={{ p: 3 }}>
      <ListaClientes 
        clientes={clientes}
        loading={loading}
        onEdit={handleEditClick}
        onView={handleViewClick}
        onDelete={handleDeleteClick}
        onRefresh={refreshClientes}
        onAddNew={() => handleEditClick(null)}
      />

      {/* Formulario de Cliente */}
      <FormularioCliente
        open={isFormOpen}
        onClose={handleCloseForm}
        cliente={selectedCliente}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {/* Detalle de Cliente */}
      <DetalleCliente
        open={isViewOpen}
        onClose={handleCloseView}
        cliente={selectedCliente}
        onEdit={handleEditClick}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar al cliente {selectedCliente?.nombre} {selectedCliente?.apellidoPaterno}? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Clientes;
