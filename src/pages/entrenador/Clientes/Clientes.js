import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, TextField, Box,
  Typography, IconButton, CircularProgress, Alert, Snackbar,
  Card, CardContent, Grid, Button, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getClientes } from '../../../services/clientesService';
import api from '../../../services/api';
import EditClienteForm from './EditClienteForm';
import './Clientes.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [asistenciasHoy, setAsistenciasHoy] = useState([]);

  // Función para cargar las asistencias de hoy
  const fetchAsistenciasHoy = async () => {
    try {
      const response = await api.get('/api/asistencias/hoy');
      setAsistenciasHoy(response.data?.asistencias || []);
    } catch (error) {
      console.error('Error al cargar asistencias de hoy:', error);
      setAsistenciasHoy([]);
    }
  };

  // Función para marcar la asistencia de un cliente
  const marcarAsistencia = async (clienteId) => {
    console.log('Iniciando marcado de asistencia para cliente:', clienteId);
    try {
      // Verificar si el cliente ya tiene asistencia hoy
      const tieneAsistencia = asistenciasHoy.some(a => a.miembro_id === clienteId);

      if (tieneAsistencia) {
        setSnackbar({
          open: true,
          message: 'El cliente ya tiene asistencia registrada hoy',
          severity: 'info'
        });
        return;
      }

      // Marcar asistencia
      const url = '/api/asistencias/registrar_entrada';
      console.log('Llamando a la API con URL:', api.defaults.baseURL + url);
      const response = await api.post(url, {
        miembro_id: clienteId,
        fecha: new Date().toISOString().split('T')[0],
        hora_entrada: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      });
      console.log('Respuesta de la API:', response.data);

      // Actualizar la lista de asistencias
      await fetchAsistenciasHoy();

      setSnackbar({
        open: true,
        message: 'Asistencia registrada correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      setSnackbar({
        open: true,
        message: 'Error al marcar la asistencia',
        severity: 'error'
      });
    }
  };



  // Función para cargar los clientes
  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar si hay un token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa. Por favor, inicie sesión.');
        setSnackbar({
          open: true,
          message: 'No hay sesión activa. Por favor, inicie sesión.',
          severity: 'error'
        });
        return;
      }

      const response = await getClientes();
      console.log('DEBUG - Respuesta completa de la API:', response);

      // Asegurarse de que response es un array
      const data = Array.isArray(response) ? response : [response];
      console.log('DEBUG - Datos procesados:', data);

      // Mapear los datos del backend al formato esperado por la tabla
      const clientesFormateados = data.map((cliente, index) => {
        console.log(`\nDEBUG - Cliente #${index + 1}:`, cliente);
        console.log('Claves del objeto cliente:', Object.keys(cliente));
        console.log('¿Tiene teléfono?', 'telefono' in cliente, 'Valor:', cliente.telefono);
        console.log('¿Tiene fecha_vencimiento_membresia?', 'fecha_vencimiento_membresia' in cliente, 'Valor:', cliente.fecha_vencimiento_membresia);

        return {
          id: cliente.id,
          nombre: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
          email: cliente.email || 'Sin correo',
          telefono: cliente.telefono || 'Sin teléfono',
          // Asegurarse de que la fecha de registro se maneje correctamente
          fechaRegistro: cliente.fecha_registro || cliente.fechaRegistro || new Date().toISOString(),
          // Asegurarse de que la fecha de vencimiento se maneje correctamente
          fechaVencimiento: cliente.fecha_vencimiento_membresia || cliente.fechaVencimiento || null,
          // Incluir tipo de membresía si está disponible
          tipoMembresia: cliente.tipoMembresia || cliente.tipo_membresia || 'No especificada',
          // Estado de la membresía
          activo: cliente.activo !== false,
          // Condiciones médicas y observaciones
          condicionesMedicas: cliente.condiciones_medicas || cliente.condicionesMedicas || null,
          observaciones: cliente.observaciones || null
        };
      });

      console.log('Clientes formateados:', clientesFormateados); // Debug log
      setClientes(clientesFormateados);
    } catch (err) {
      console.error('Error al cargar clientes:', err);

      // Manejar diferentes tipos de errores
      if (err.message === 'Network Error') {
        setError('Error de conexión con el servidor. Verifique que el backend esté ejecutándose.');
        setSnackbar({
          open: true,
          message: 'Error de conexión con el servidor',
          severity: 'error'
        });
      } else if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        setSnackbar({
          open: true,
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          severity: 'error'
        });
        // Redirigir al login
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError('No tiene permisos para acceder a esta información.');
        setSnackbar({
          open: true,
          message: 'No tiene permisos para acceder a esta información.',
          severity: 'error'
        });
      } else {
        setError('No se pudieron cargar los clientes. Por favor, intente de nuevo.');
        setSnackbar({
          open: true,
          message: 'Error al cargar los clientes',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes al montar el componente o cuando se actualice refresh
  useEffect(() => {
    fetchClientes();
    fetchAsistenciasHoy();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(parseInt(newRowsPerPage, 10));
    setPage(0);
  };

  const handleCloseSnackbar = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Funciones para manejar el modal de detalles
  const handleOpenModal = (cliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCliente(null);
  };

  // Funciones para manejar el modal de edición
  const handleOpenEditModal = (cliente) => {
    setEditingCliente({ ...cliente });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingCliente(null);
  };



  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    try {
      const response = await api.put(`/miembros/${editingCliente.id}`, {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        fecha_inscripcion: formData.fecha_inscripcion,
        activo: formData.activo,
        rol_id: formData.rol_id,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        direccion: formData.direccion,
        tipo_membresia: formData.tipo_membresia,
        fecha_vencimiento_membresia: formData.fecha_vencimiento_membresia,
        condiciones_medicas: formData.condiciones_medicas,
        observaciones: formData.observaciones
      });

      setSnackbar({
        open: true,
        message: 'Cliente actualizado correctamente',
        severity: 'success'
      });

      handleCloseEditModal();
      fetchClientes(); // Recargar la lista
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al actualizar el cliente',
        severity: 'error'
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Filtrar clientes por término de búsqueda
  const filteredClientes = clientes.filter(cliente => {
    // Asegurarse de que el cliente y sus propiedades existan
    if (!cliente) return false;

    // Buscar en las propiedades relevantes
    const searchableFields = [
      'id',
      'nombre',
      'email',
      'telefono',
      'tipoMembresia'
    ];

    return searchableFields.some(field => {
      const value = cliente[field];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Paginación
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredClientes.length - page * rowsPerPage);
  const paginatedClientes = filteredClientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        {/* Título arriba */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0, mr: 2 }}>
            <i className="bi bi-people-fill" style={{ marginRight: 10 }}></i>
            Mis Clientes
          </Typography>
          <IconButton
            onClick={handleRefresh}
            color="primary"
            disabled={loading}
            title="Actualizar lista"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Tarjetas de estadísticas */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {/* Tarjeta Total de Clientes */}
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="bi bi-people-fill" style={{ fontSize: '1.5rem' }}></i>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total de Clientes
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {clientes.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Clientes registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Tarjeta Clientes Activos */}
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 40px rgba(17, 153, 142, 0.4)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="bi bi-check-circle-fill" style={{ fontSize: '1.5rem' }}></i>
                    </Box>

                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {clientes.filter(c => {
                      // Consider a membership active only if activo is true and not expired
                      if (!c.activo) return false;
                      if (!c.fechaVencimiento) return true; // No expiration date, consider active

                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
                      const expiry = new Date(c.fechaVencimiento);

                      return expiry >= today;
                    }).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {clientes.length > 0 ? `Membresías vigentes (${clientes.length} total)` : 'Membresías vigentes'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>


          </Grid>
        </Box>

        {/* Buscador */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            label="Buscar cliente"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            disabled={loading}
          />
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : clientes.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron clientes asignados.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de clientes">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vencimiento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClientes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cliente) => {
                  // Resaltar si la membresía vence en <= 7 días o ya venció
                  const hoy = new Date();
                  const vencimiento = cliente.fechaVencimiento ? new Date(cliente.fechaVencimiento) : null;
                  const diff = vencimiento ? (vencimiento - hoy) / (1000 * 60 * 60 * 24) : Infinity;
                  const highlight = vencimiento && diff <= 7;

                  // Verificar si el cliente tiene asistencia hoy
                  const tieneAsistenciaHoy = asistenciasHoy.some(
                    asistencia => asistencia.miembro_id === cliente.id
                  );

                  return (
                    <TableRow
                      key={cliente.id}
                      sx={{
                        backgroundColor: highlight ? 'rgba(255, 167, 38, 0.1)' : 'inherit',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <TableCell>{cliente.id}</TableCell>
                      <TableCell>{cliente.nombre}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell
                        sx={{
                          ...(vencimiento && diff < 0
                            ? { backgroundColor: '#ffcccc', color: '#b71c1c', fontWeight: 'bold' } // Rojo: vencido
                            : vencimiento && diff <= 7
                              ? { backgroundColor: '#fff9c4', color: '#bfa600', fontWeight: 'bold' } // Amarillo: por vencer
                              : { backgroundColor: '#c8e6c9', color: '#256029', fontWeight: 'bold' } // Verde: al día
                          )
                        }}
                      >
                        {cliente.fechaVencimiento
                          ? new Date(cliente.fechaVencimiento).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          : 'Sin fecha'}
                      </TableCell>

                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            title="Ver detalles"
                            onClick={() => handleOpenModal(cliente)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            title="Editar"
                            onClick={() => handleOpenEditModal(cliente)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredClientes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

      {/* Modal de Detalles del Cliente */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              <i className="bi bi-person-circle" style={{ marginRight: 10 }}></i>
              Detalles del Cliente
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCliente && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Información Básica */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      <i className="bi bi-info-circle" style={{ marginRight: 8 }}></i>
                      Información Básica
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>ID:</strong> {selectedCliente.id}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Nombre:</strong> {selectedCliente.nombre}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Email:</strong> {selectedCliente.email}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Teléfono:</strong> {selectedCliente.telefono}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Tipo de Membresía:</strong> {selectedCliente.tipoMembresia}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Estado:</strong>
                        <Chip
                          label={selectedCliente.activo ? 'Activo' : 'Inactivo'}
                          color={selectedCliente.activo ? 'success' : 'error'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Fechas */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      <i className="bi bi-calendar-event" style={{ marginRight: 8 }}></i>
                      Fechas Importantes
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Fecha de Registro:</strong>
                        {selectedCliente.fechaRegistro ?
                          new Date(selectedCliente.fechaRegistro).toLocaleDateString('es-ES') :
                          'No especificada'
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Vencimiento de Membresía:</strong>
                        {selectedCliente.fechaVencimiento ?
                          new Date(selectedCliente.fechaVencimiento).toLocaleDateString('es-ES') :
                          'No especificada'
                        }
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Condiciones Médicas */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }}></i>
                      Condiciones Especiales
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {selectedCliente.condicionesMedicas ? (
                        <Typography variant="body2">
                          {Array.isArray(selectedCliente.condicionesMedicas)
                            ? selectedCliente.condicionesMedicas.join(', ')
                            : selectedCliente.condicionesMedicas
                          }
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No hay condiciones especiales registradas
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* Observaciones */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="info.main">
                      <i className="bi bi-chat-text" style={{ marginRight: 8 }}></i>
                      Observaciones
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {selectedCliente.observaciones ? (
                        <Typography variant="body2">
                          {selectedCliente.observaciones}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No hay observaciones registradas
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edición del Cliente usando nuestro formulario personalizado */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <EditClienteForm
          cliente={editingCliente}
          onSave={handleEditSubmit}
          onCancel={handleCloseEditModal}
          loading={editLoading}
        />
      </Dialog>

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
