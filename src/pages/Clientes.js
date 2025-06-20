import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TablePagination, TextField, Box, 
  Typography, IconButton, CircularProgress, Alert, Snackbar,
  Card, CardContent, Grid
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  People as PeopleIcon 
} from '@mui/icons-material';
import { getClientes } from '../services/clientesService';
import MemberModal from '../components/MemberModal';
import api from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Button from '@mui/material/Button';


const Clientes = () => {
  const [clientes, setClientes] = useState([]);
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
  const [asistenciasHoy, setAsistenciasHoy] = useState([]);


  // Función para cargar los clientes
  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientes();
    console.log('DEBUG respuesta de getClientes:', data);
      // Mapear los datos del backend al formato esperado por la tabla
      const clientesFormateados = data.map(cliente => ({
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
        email: cliente.email || 'Sin correo',
        telefono: cliente.telefono || 'Sin teléfono',
        fechaRegistro: cliente.fecha_registro || new Date().toISOString().split('T')[0]
      }));
      setClientes(clientesFormateados);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('No se pudieron cargar los clientes. Por favor, intente de nuevo.');
      setSnackbar({
        open: true,
        message: 'Error al cargar los clientes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes al montar el componente o cuando se actualice refresh
  useEffect(() => {
    fetchClientes();
    fetchAsistenciasHoy();
  }, [refresh]);

  // Cargar asistencias de hoy
  const fetchAsistenciasHoy = async () => {
    try {
      const response = await api.get('/asistencias');
      setAsistenciasHoy(response.data);
    } catch (error) {
      console.error('Error al cargar asistencias de hoy:', error);
    }
  };

  // Verifica si el cliente ya marcó asistencia hoy
  const tieneAsistenciaHoy = (clienteId) => {
    return asistenciasHoy.some(a => a.miembro_id === clienteId);
  };

  // Marcar asistencia para un cliente
  const handleMarcarAsistencia = async (cliente) => {
  console.log('DEBUG cliente recibido en handleMarcarAsistencia:', cliente);
    if (!cliente || !cliente.id) {
      setSnackbar({ open: true, message: 'Cliente no válido', severity: 'error' });
      return;
    }
    try {
      await api.post('/asistencias', {
        miembro_id: cliente.id,
        tipo_asistencia: 'entrenamiento',
        notas: 'Asistencia marcada desde Clientes'
      });
      setSnackbar({ open: true, message: 'Asistencia marcada correctamente', severity: 'success' });
      fetchAsistenciasHoy();
      // Actualizar tabla de asistencias si está abierta
      if (window.actualizarAsistenciasTabla) {
        window.actualizarAsistenciasTabla();
      }
    } catch (error) {
      console.log('DEBUG error al marcar asistencia:', error.response?.data);
    setSnackbar({ open: true, message: 'Error al marcar asistencia', severity: 'error' });
    }
  };



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

  // Filtrar clientes por término de búsqueda
  const filteredClientes = clientes.filter(cliente => 
    Object.values(cliente).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
            Gestión de Clientes
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
        {/* Botones de formularios debajo del título */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <MemberModal onMemberCreated={handleRefresh} />
        </Box>
        
        {/* Tarjeta de resumen */}
        
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
          No se encontraron clientes registrados.
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Registro</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asistencia Hoy</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClientes.map((cliente) => (
                <TableRow 
                  key={cliente.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{cliente.id}</TableCell>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{new Date(cliente.fechaRegistro).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={tieneAsistenciaHoy(cliente.id) ? 'success' : 'primary'}
                    size="small"
                    startIcon={tieneAsistenciaHoy(cliente.id) ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                    disabled={tieneAsistenciaHoy(cliente.id)}
                    onClick={() => handleMarcarAsistencia(cliente)}
                  >
                    {tieneAsistenciaHoy(cliente.id) ? 'Marcada' : 'Marcar asistencia'}
                  </Button>
                </TableCell>
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
