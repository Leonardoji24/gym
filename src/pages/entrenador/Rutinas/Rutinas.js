import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DataGrid, 
  GridToolbar,
  GridActionsCellItem 
} from '@mui/x-data-grid';
import { 
  Button, 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Chip, 
  Card, 
  CardContent, 
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  FitnessCenter,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  ContentCopy as CopyIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { 
  getRutinas, 
  deleteRutina, 
  NIVELES, 
  OBJETIVOS 
} from '../../../services/rutinasService';
import { useAuth } from '../../../contexts/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Rutinas = () => {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid'); // 'grid' o 'list'
  const [filterNivel, setFilterNivel] = useState('');
  const [filterObjetivo, setFilterObjetivo] = useState('');
  const [selectedRutina, setSelectedRutina] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rutinaToDelete, setRutinaToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Verificar si necesitamos forzar una recarga
  useEffect(() => {
    if (location.state?.shouldRefresh) {
      fetchRutinas();
      // Limpiar el estado para evitar recargas innecesarias
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  // Cargar rutinas
  const fetchRutinas = async () => {
    try {
      setLoading(true);
      const data = await getRutinas();
      setRutinas(data);
    } catch (error) {
      console.error('Error al cargar rutinas:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las rutinas',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar rutinas al montar el componente
  useEffect(() => {
    fetchRutinas();
    
    // Configurar el evento para detectar cuando volvemos a la página
    const handlePopState = () => {
      fetchRutinas();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Filtrar rutinas
  const filteredRutinas = rutinas.filter(rutina => {
    const matchesSearch = rutina.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rutina.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = !filterNivel || rutina.nivel === filterNivel;
    const matchesObjetivo = !filterObjetivo || rutina.objetivo === filterObjetivo;
    
    return matchesSearch && matchesNivel && matchesObjetivo;
  });

  // Manejar eliminación de rutina
  const handleDeleteRutina = async () => {
    try {
      await deleteRutina(rutinaToDelete.id);
      setSnackbar({
        open: true,
        message: 'Rutina eliminada exitosamente',
        severity: 'success'
      });
      fetchRutinas();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Error al eliminar la rutina',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setRutinaToDelete(null);
    }
  };

  // Confirmar eliminación
  const confirmDelete = (rutina) => {
    setRutinaToDelete(rutina);
    setDeleteDialogOpen(true);
  };

  // Cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Columnas para la vista de lista
  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      renderCell: (params) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{params.value}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            {params.row.descripcion}
          </div>
        </div>
      )
    },
    {
      field: 'nivel',
      headerName: 'Nivel',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={NIVELES.find(n => n.value === params.value)?.label || params.value}
          color={
            params.value === 'principiante' ? 'primary' :
            params.value === 'intermedio' ? 'secondary' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'objetivo',
      headerName: 'Objetivo',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={OBJETIVOS.find(o => o.value === params.value)?.label || params.value}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'duracion_semanas',
      headerName: 'Duración',
      width: 100,
      renderCell: (params) => `${params.value} semanas`
    },
    {
      field: 'frecuencia_semanal',
      headerName: 'Frecuencia',
      width: 120,
      renderCell: (params) => `${params.value}x por semana`
    },
    {
      field: 'clientes_asignados',
      headerName: 'Clientes',
      width: 100,
      renderCell: (params) => params.value || 0
    },
    {
      field: 'dias_rutina',
      headerName: 'Días',
      width: 80,
      renderCell: (params) => params.value || 0
    },
    {
      field: 'fecha_creacion',
      headerName: 'Creada',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="Ver"
          onClick={() => navigate(`/entrenador/rutinas/${params.row.id}`)}
        />,
        <GridActionsCellItem
          icon={<AssignIcon />}
          label="Asignar"
          onClick={() => navigate(`/entrenador/rutinas/${params.row.id}/asignar`)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => confirmDelete(params.row)}
        />
      ]
    }
  ];

  // Obtener color del nivel
  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'principiante': return '#3b82f6';
      case 'intermedio': return '#f59e0b';
      case 'avanzado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Obtener color del objetivo
  const getObjetivoColor = (objetivo) => {
    switch (objetivo) {
      case 'perdida_peso': return '#ef4444';
      case 'ganancia_muscular': return '#3b82f6';
      case 'resistencia': return '#10b981';
      case 'fuerza': return '#f59e0b';
      case 'flexibilidad': return '#8b5cf6';
      case 'salud_general': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  return (
    <div className="entrenador-page">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Mis Rutinas
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={view === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setView('grid')}
            size="small"
          >
            Cuadrícula
          </Button>
          <Button
            variant={view === 'list' ? 'contained' : 'outlined'}
            onClick={() => setView('list')}
            size="small"
          >
            Lista
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/entrenador/rutinas/nueva')}
          >
            Nueva Rutina
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          variant="outlined"
          placeholder="Buscar rutinas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Nivel</InputLabel>
          <Select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            label="Nivel"
          >
            <MenuItem value="">Todos</MenuItem>
            {NIVELES.map((nivel) => (
              <MenuItem key={nivel.value} value={nivel.value}>
                {nivel.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Objetivo</InputLabel>
          <Select
            value={filterObjetivo}
            onChange={(e) => setFilterObjetivo(e.target.value)}
            label="Objetivo"
          >
            <MenuItem value="">Todos</MenuItem>
            {OBJETIVOS.map((objetivo) => (
              <MenuItem key={objetivo.value} value={objetivo.value}>
                {objetivo.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Contenido */}
      {view === 'list' ? (
        <div style={{ height: 600, width: '100%', backgroundColor: 'white' }}>
          <DataGrid
            rows={filteredRutinas}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            loading={loading}
            disableSelectionOnClick
            components={{
              Toolbar: GridToolbar,
            }}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f8fafc',
                color: '#374151',
              },
            }}
          />
        </div>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={3}>
          {filteredRutinas.map((rutina) => (
            <Card key={rutina.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <FitnessCenter 
                    color="primary" 
                    sx={{ mr: 1, color: getNivelColor(rutina.nivel) }} 
                  />
                  <Typography variant="h6" component="div">
                    {rutina.nombre}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {rutina.descripcion}
                </Typography>
                
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={NIVELES.find(n => n.value === rutina.nivel)?.label || rutina.nivel}
                    size="small"
                    sx={{ backgroundColor: getNivelColor(rutina.nivel), color: 'white' }}
                  />
                  <Chip
                    label={OBJETIVOS.find(o => o.value === rutina.objetivo)?.label || rutina.objetivo}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: getObjetivoColor(rutina.objetivo), color: getObjetivoColor(rutina.objetivo) }}
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {rutina.duracion_semanas} semanas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rutina.frecuencia_semanal}x por semana
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {rutina.total_ejercicios || 0} ejercicios
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rutina.total_clientes || 0} clientes
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Creada: {new Date(rutina.fecha_creacion).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  onClick={() => navigate(`/entrenador/rutinas/${rutina.id}`)}
                >
                  Ver detalles
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/entrenador/rutinas/${rutina.id}/asignar`)}
                >
                  Asignar
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => confirmDelete(rutina)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la rutina "{rutinaToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteRutina} color="error" variant="contained">
            Eliminar
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
    </div>
  );
};

export default Rutinas;
