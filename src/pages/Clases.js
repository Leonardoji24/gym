import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TablePagination, TextField, Box, 
  Typography, IconButton, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getClases } from '../services/clasesService';

const Clases = () => {
  const [clases, setClases] = useState([]);
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

  // Función para cargar las clases
  const fetchClases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClases();
      // Mapear los datos del backend al formato esperado por la tabla
      const clasesFormateadas = data.map(clase => ({
        id: clase.id_clase,
        nombre: clase.nombre || '',
        descripcion: clase.descripcion || '',
        horario: clase.horario || '',
        cupoMaximo: clase.cupo_maximo || '',
        entrenador: clase.nombre_entrenador || clase.id_entrenador || 'Sin asignar',
        fechaCreacion: clase.fecha_creacion || new Date().toISOString().split('T')[0]
      }));
      setClases(clasesFormateadas);
    } catch (err) {
      console.error('Error al cargar clases:', err);
      setError('No se pudieron cargar las clases. Por favor, intente de nuevo.');
      setSnackbar({
        open: true,
        message: 'Error al cargar las clases',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClases();
  }, [refresh]);

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

  // Filtrar clases por término de búsqueda
  const filteredClases = clases.filter(clase => 
    Object.values(clase).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredClases.length - page * rowsPerPage);
  const paginatedClases = filteredClases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        {/* Título arriba */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0, mr: 2 }}>
            <i className="bi bi-pencil-square" style={{ marginRight: 10 }}></i>
            Gestión de Clases
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
        {/* Buscador */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            label="Buscar clase"
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
      ) : clases.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron clases registradas.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de clases">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Horario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cupo Máximo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Entrenador</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Creación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClases.map((clase) => (
                <TableRow 
                  key={clase.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{clase.id}</TableCell>
                  <TableCell>{clase.nombre}</TableCell>
                  <TableCell>{clase.descripcion}</TableCell>
                  <TableCell>{clase.horario}</TableCell>
                  <TableCell>{clase.cupoMaximo}</TableCell>
                  <TableCell>{clase.entrenador}</TableCell>
                  <TableCell>{new Date(clase.fechaCreacion).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
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
            count={filteredClases.length}
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

export default Clases;
