import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TablePagination, TextField, Box, 
  Typography, IconButton, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { 
  getInventario, 
  createInventario, 
  updateInventario, 
  deleteInventario 
} from '../../services/inventarioService';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Select,
  TextareaAutosize
} from '@mui/material';

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
  
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'equipo',
    cantidad: 0,
    descripcion: '',
    estado: 'activo',
    proveedor: '',
    ubicacion: '',
    precio_unitario: ''
  });
  
  const tipos = ['equipo', 'suplemento', 'otro'];
  const estados = ['activo', 'en reparacion', 'agotado', 'dado de baja'];

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
  
  const handleOpenDialog = () => {
    setEditing(false);
    setFormData({
      nombre: '',
      tipo: 'equipo',
      cantidad: 0,
      descripcion: '',
      estado: 'activo',
      proveedor: '',
      ubicacion: '',
      precio_unitario: ''
    });
    setOpenDialog(true);
  };
  
  const handleEditDialog = (item) => {
    setEditing(true);
    setCurrentItem(item);
    setFormData({
      nombre: item.nombre || '',
      tipo: item.tipo || 'equipo',
      cantidad: item.cantidad || 0,
      descripcion: item.descripcion || '',
      estado: item.estado || 'activo',
      proveedor: item.proveedor || '',
      ubicacion: item.ubicacion || '',
      precio_unitario: item.precio_unitario || ''
    });
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'precio_unitario' 
        ? parseFloat(value) || 0 
        : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && currentItem) {
        await updateInventario(currentItem.id, formData);
        setSnackbar({
          open: true,
          message: '¡Artículo actualizado correctamente!',
          severity: 'success'
        });
      } else {
        await createInventario(formData);
        setSnackbar({
          open: true,
          message: '¡Artículo creado correctamente!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchInventario();
    } catch (error) {
      console.error('Error al guardar el artículo:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el artículo',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    
    try {
      await deleteInventario(currentItem.id);
      setSnackbar({
        open: true,
        message: '¡Artículo eliminado correctamente!',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      fetchInventario();
    } catch (error) {
      console.error('Error al eliminar el artículo:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el artículo',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCurrentItem(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 0, mr: 2 }}>
              <i className="bi bi-box" style={{ marginRight: 10 }}></i>
              Inventario
            </Typography>
            <IconButton 
              onClick={handleRefresh} 
              color="primary" 
              disabled={loading}
              title="Actualizar lista"
              size="large"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Nuevo Artículo
          </Button>
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
                  <TableCell>
                    <Box 
                      component="span" 
                      sx={{
                        p: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: item.estado === 'activo' ? 'success.light' : 
                                        item.estado === 'en reparacion' ? 'warning.light' :
                                        item.estado === 'agotado' ? 'error.light' : 'grey.300',
                        color: item.estado === 'dado de baja' ? 'grey.800' : 'common.white',
                        fontWeight: 'medium',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.estado}
                    </Box>
                  </TableCell>
                  <TableCell>{item.proveedor || '-'}</TableCell>
                  <TableCell>{item.ubicacion || '-'}</TableCell>
                  <TableCell>
                    {item.precio_unitario ? 
                      new Intl.NumberFormat('es-MX', { 
                        style: 'currency', 
                        currency: 'MXN' 
                      }).format(item.precio_unitario) : '$0.00'}
                  </TableCell>
                  <TableCell>{item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString() : ''}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
                            title={item.descripcion}>
                    {item.descripcion || '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditDialog(item)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(item)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
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
      {/* Diálogo para agregar/editar artículos */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editing ? 'Editar Artículo' : 'Agregar Nuevo Artículo'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                id="nombre"
                name="nombre"
                label="Nombre del artículo"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel id="tipo-label">Tipo</InputLabel>
                <Select
                  labelId="tipo-label"
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  label="Tipo"
                  onChange={handleInputChange}
                  required
                >
                  {tipos.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="dense"
                  id="cantidad"
                  name="cantidad"
                  label="Cantidad"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                  required
                />
                
                <FormControl fullWidth margin="dense">
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    label="Estado"
                    onChange={handleInputChange}
                    required
                  >
                    {estados.map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1).replace('-', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="dense"
                  id="proveedor"
                  name="proveedor"
                  label="Proveedor"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.proveedor}
                  onChange={handleInputChange}
                />
                
                <TextField
                  margin="dense"
                  id="ubicacion"
                  name="ubicacion"
                  label="Ubicación"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                />
              </Box>
              
              <TextField
                margin="dense"
                id="precio_unitario"
                name="precio_unitario"
                label="Precio Unitario"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.precio_unitario}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: '0.01' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              
              <TextField
                margin="dense"
                id="descripcion"
                name="descripcion"
                label="Descripción"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              startIcon={editing ? <SaveIcon /> : <AddIcon />}
            >
              {editing ? 'Guardar Cambios' : 'Agregar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el artículo "{currentItem?.nombre}"? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notificación */}
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
