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
import { getInventario } from '../services/inventarioService';

const Inventario = () => {
  const [items, setItems] = useState([]);
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

  const fetchInventario = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventario();
      setItems(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('No se pudo cargar el inventario.');
      setSnackbar({
        open: true,
        message: 'Error al cargar el inventario',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
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

  // Filtrar inventario por término de búsqueda
  const filteredItems = items.filter(item => 
    Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredItems.length - page * rowsPerPage);
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0, mr: 2 }}>
            <i className="bi bi-box" style={{ marginRight: 10 }}></i>
            Inventario
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            label="Buscar recurso"
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
      ) : items.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron recursos en el inventario.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 900 }} aria-label="tabla de inventario">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cantidad</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Proveedor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ubicación</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio Unitario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Registro</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow 
                  key={item.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>{item.estado}</TableCell>
                  <TableCell>{item.proveedor}</TableCell>
                  <TableCell>{item.ubicacion}</TableCell>
                  <TableCell>{item.precio_unitario}</TableCell>
                  <TableCell>{item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={10} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredItems.length}
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

export default Inventario;
