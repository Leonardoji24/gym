import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TablePagination, TextField, Box, 
  Typography, IconButton, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getEntrenadores } from '../../services/entrenadoresService';
import api from '../../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Button from '@mui/material/Button';
import AddEntrenadorForm from '../../components/acciones/AddEntrenadorForm';

const Entrenadores = () => {
  const [entrenadores, setEntrenadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [sHoy, setAsistenciasHoy] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);


  // Función para cargar los entrenadores
  const fetchEntrenadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEntrenadores();
      console.log('Datos de entrenadores recibidos:', data); // Para depuración
      
      // Mapear los datos del backend al formato esperado por la tabla
      const entrenadoresFormateados = data.map(entrenador => {
        console.log('Procesando entrenador:', entrenador); // Para depuración
        return {
          id: entrenador.id_miembro || entrenador.id || 'N/A',
          nombre: `${entrenador.nombre || ''} ${entrenador.apellido || ''}`.trim() || 'Nombre no disponible',
          email: entrenador.email || 'Sin correo',
          telefono: entrenador.telefono || 'Sin teléfono',
          fechaRegistro: entrenador.fecha_registro || new Date().toISOString().split('T')[0]
        };
      });
      
      setEntrenadores(entrenadoresFormateados);
    } catch (err) {
      console.error('Error al cargar entrenadores:', err);
      setError('No se pudieron cargar los entrenadores. Por favor, intente de nuevo.');
      setSnackbar({
        open: true,
        message: 'Error al cargar los entrenadores',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntrenadores();
    fetchAsistenciasHoy();
  }, [refresh]);

  // Cargar s de hoy
  const fetchAsistenciasHoy = async () => {
    try {
      const response = await api.get('/s');
      setAsistenciasHoy(response.data);
    } catch (error) {
      console.error('Error al cargar s de hoy:', error);
    }
  };

  // Verifica si el entrenador ya marcó asistencia hoy
  const tieneAsistenciaHoy = (entrenadorId) => {
    return sHoy.some(a => a.miembro_id === entrenadorId);
  };

  // Abrir diálogo para agregar entrenador
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  // Cerrar diálogo para agregar entrenador
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  // Manejar cuando se crea un nuevo entrenador exitosamente
  const handleTrainerCreated = () => {
    setOpenAddDialog(false);
    fetchEntrenadores(); // Refrescar la lista de entrenadores
    setSnackbar({
      open: true,
      message: 'Entrenador registrado exitosamente',
      severity: 'success'
    });
  };

  // Marcar  para un entrenador
  const handleMarcarAsistencia = async (entrenador) => {
    if (!entrenador || !entrenador.id) {
      setSnackbar({ open: true, message: 'Entrenador no válido', severity: 'error' });
      return;
    }
    try {
      await api.post('/s', {
        miembro_id: entrenador.id,
        tipo_: 'entrenamiento',
        notas: 'Asistencia marcada desde Entrenadores'
      });
      setSnackbar({ open: true, message: 'Asistencia marcada correctamente', severity: 'success' });
      fetchAsistenciasHoy();
      // Actualizar tabla de s si está abierta
      if (window.actualizarAsistenciasTabla) {
        window.actualizarAsistenciasTabla();
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al marcar ', severity: 'error' });
    }
  };



  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filtrar entrenadores por término de búsqueda
  const filteredEntrenadores = entrenadores.filter(entrenador => 
    Object.values(entrenador).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredEntrenadores.length - page * rowsPerPage);
  const paginatedEntrenadores = filteredEntrenadores.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        {/* Título arriba */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0, mr: 2, flexGrow: 1 }}>
            <i className="bi bi-person-badge" style={{ marginRight: 10 }}></i>
            Gestión de Entrenadores
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nuevo Entrenador
            </Button>
            <IconButton 
              onClick={handleRefresh} 
              color="primary" 
              disabled={loading}
              title="Actualizar lista"
              sx={{ border: '1px solid rgba(0, 0, 0, 0.23)' }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        {/* Buscador */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            label="Buscar entrenador"
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
      ) : entrenadores.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron entrenadores registrados.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de entrenadores">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Registro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEntrenadores.map((entrenador) => (
                <TableRow 
                  key={entrenador.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{entrenador.id}</TableCell>
                  <TableCell>{entrenador.nombre}</TableCell>
                  <TableCell>{entrenador.email}</TableCell>
                  <TableCell>{entrenador.telefono}</TableCell>
                  <TableCell>{new Date(entrenador.fechaRegistro).toLocaleDateString()}</TableCell>
                  </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredEntrenadores.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}

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

      {/* Diálogo para agregar nuevo entrenador */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Registrar Nuevo Entrenador</DialogTitle>
        <DialogContent>
          <AddEntrenadorForm 
            onClose={handleCloseAddDialog} 
            onTrainerCreated={handleTrainerCreated} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Entrenadores;
