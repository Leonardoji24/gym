import React, { useState, useEffect } from 'react';
import { 
  Grid, TextField, Box, Typography, IconButton, 
  CircularProgress, Alert, Snackbar, Button, 
  Pagination, InputAdornment, Paper
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getClases } from '../../services/clasesService';
import ClassCard from '../../components/cards/ClassCard';
import { getEntrenadores } from '../../services/entrenadoresService';
import AddClaseForm from '../../components/acciones/AddClaseForm';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

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
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [entrenadores, setEntrenadores] = useState([]);
  const [loadingEntrenadores, setLoadingEntrenadores] = useState(false);

  // Función para cargar los entrenadores
  const fetchEntrenadores = async () => {
    try {
      setLoadingEntrenadores(true);
      const data = await getEntrenadores();
      console.log('Datos de entrenadores recibidos en Clases:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido para entrenadores');
      }
      
      // Asegurarse de que los entrenadores tengan los campos requeridos
      const entrenadoresFormateados = data.map(entrenador => ({
        id_miembro: entrenador.id_miembro || entrenador.id,
        nombre: entrenador.nombre || 'Sin nombre',
        apellido: entrenador.apellido || '',
        email: entrenador.email || 'Sin correo',
        telefono: entrenador.telefono || 'Sin teléfono'
      }));
      
      setEntrenadores(entrenadoresFormateados);
      return entrenadoresFormateados;
    } catch (error) {
      console.error('Error al cargar los entrenadores:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar la lista de entrenadores',
        severity: 'error'
      });
      throw error;
    } finally {
      setLoadingEntrenadores(false);
    }
  };

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
        entrenador: clase.nombre_entrenador || 'Sin asignar',
        id_entrenador: clase.id_entrenador || null,
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
    fetchEntrenadores();
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



  const handleOpenAddDialog = async () => {
    try {
      // Cargar los entrenadores antes de abrir el diálogo
      const entrenadoresData = await fetchEntrenadores();
      if (entrenadoresData && entrenadoresData.length > 0) {
        setOpenAddDialog(true);
      } else {
        setSnackbar({
          open: true,
          message: 'No hay entrenadores disponibles. Por favor, registre al menos un entrenador primero.',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error al abrir el diálogo de nueva clase:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo cargar la lista de entrenadores',
        severity: 'error'
      });
    }
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleClassCreated = () => {
    setOpenAddDialog(false);
    fetchClases(); // Refresh the classes list
    setSnackbar({
      open: true,
      message: 'Clase registrada exitosamente',
      severity: 'success'
    });
  };

  // Filtrar clases por término de búsqueda
  const filteredClases = clases.filter(clase => 
    Object.values(clase).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const pageCount = Math.ceil(filteredClases.length / rowsPerPage);
  const paginatedClases = filteredClases.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const handleEdit = (clase) => {
    // Implementar lógica de edición
    console.log('Editar clase:', clase);
  };

  const handleDelete = (id) => {
    // Implementar lógica de eliminación
    console.log('Eliminar clase con ID:', id);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        {/* Título y controles */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
              <i className="bi bi-pencil-square" style={{ marginRight: 10 }}></i>
              Gestión de Clases
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
            onClick={handleOpenAddDialog}
          >
            Nueva Clase
          </Button>
        </Box>
        
        {/* Buscador */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar clases..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0); // Resetear a la primera página al buscar
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            disabled={loading}
          />
        </Paper>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredClases.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No se encontraron clases que coincidan con la búsqueda.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedClases.map((clase) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={clase.id}>
                <ClassCard 
                  clase={clase} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Paginación personalizada */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination
                count={pageCount}
                page={page + 1}
                onChange={(event, value) => setPage(value - 1)}
                color="primary"
                showFirstButton
                showLastButton
                sx={{ '& .MuiPagination-ul': { flexWrap: 'nowrap' } }}
              />
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
            <TextField
              select
              size="small"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              SelectProps={{
                native: true,
              }}
              sx={{ minWidth: 120 }}
            >
              {[4, 8, 12, 24].map((option) => (
                <option key={option} value={option}>
                  {option} por página
                </option>
              ))}
            </TextField>
          </Box>
        </>
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

      {/* Diálogo para agregar nueva clase */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Registrar Nueva Clase</DialogTitle>
        <DialogContent>
          {loadingEntrenadores ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>Cargando entrenadores...</Typography>
            </Box>
          ) : (
            <AddClaseForm 
              onClose={handleCloseAddDialog} 
              onClassCreated={handleClassCreated}
              entrenadores={entrenadores}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Clases;
