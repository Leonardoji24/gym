import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  FitnessCenter,
  Timer,
  TrendingUp,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { getRutinaDetalle, deleteRutina, NIVELES, OBJETIVOS } from '../../../services/rutinasService';
import AddRutinaForm from '../../../components/acciones/AddRutinaForm';
import AsignarRutinaForm from '../../../components/acciones/AsignarRutinaForm';

const DetalleRutina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rutina, setRutina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [asignarDialogOpen, setAsignarDialogOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRutina = async () => {
      try {
        setLoading(true);
        const data = await getRutinaDetalle(id);
        setRutina(data);
      } catch (error) {
        console.error('Error al cargar rutina:', error);
        setError('Error al cargar la rutina');
      } finally {
        setLoading(false);
      }
    };

    fetchRutina();
  }, [id]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteRutina(id);
      setSuccess(true);
      setTimeout(() => {
        navigate('/entrenador/rutinas');
      }, 2000);
    } catch (error) {
      setError('Error al eliminar la rutina');
    }
  };

  const handleAsignar = () => {
    setAsignarDialogOpen(true);
  };

  const handleRutinaUpdated = () => {
    setEditDialogOpen(false);
    // Recargar la rutina
    window.location.reload();
  };

  const handleAsignacionCompletada = () => {
    setAsignarDialogOpen(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'principiante': return '#3b82f6';
      case 'intermedio': return '#f59e0b';
      case 'avanzado': return '#ef4444';
      default: return '#6b7280';
    }
  };

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!rutina) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Rutina no encontrada</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Operación completada exitosamente.
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate('/entrenador/rutinas')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {rutina.nombre}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<AssignmentIcon />}
              onClick={handleAsignar}
              color="success"
            >
              Asignar
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Eliminar
            </Button>
          </Box>
        </Box>

        {/* Información básica */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" color="text.secondary" paragraph>
              {rutina.descripcion}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip
                label={NIVELES.find(n => n.value === rutina.nivel)?.label || rutina.nivel}
                sx={{ backgroundColor: getNivelColor(rutina.nivel), color: 'white' }}
              />
              <Chip
                label={OBJETIVOS.find(o => o.value === rutina.objetivo)?.label || rutina.objetivo}
                variant="outlined"
                sx={{ borderColor: getObjetivoColor(rutina.objetivo), color: getObjetivoColor(rutina.objetivo) }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Estadísticas */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Timer color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {rutina.duracion_semanas} semanas
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Duración del programa
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FitnessCenter color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {rutina.frecuencia_semanal}x por semana
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Frecuencia de entrenamiento
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {rutina.calorias_estimadas || 'N/A'} cal
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Calorías estimadas por sesión
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Días de entrenamiento */}
        <Typography variant="h5" gutterBottom>
          Días de Entrenamiento ({rutina.dias?.length || 0})
        </Typography>

        {rutina.dias?.map((dia, index) => (
          <Card key={dia.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {dia.nombre}
              </Typography>
              {dia.descripcion && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {dia.descripcion}
                </Typography>
              )}

              <Typography variant="subtitle1" gutterBottom>
                Ejercicios ({dia.ejercicios?.length || 0})
              </Typography>

              {dia.ejercicios?.map((ejercicio, ejercicioIndex) => (
                <Box key={ejercicioIndex} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {ejercicio.ejercicio_nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {ejercicio.ejercicio_descripcion}
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip label={`${ejercicio.series} series`} size="small" />
                    <Chip label={ejercicio.repeticiones} size="small" />
                    <Chip label={ejercicio.peso} size="small" />
                    <Chip label={`${ejercicio.tiempo_descanso}s descanso`} size="small" />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Información adicional */}
        {rutina.equipamiento_necesario && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Equipamiento Necesario
            </Typography>
            <Typography variant="body1">
              {rutina.equipamiento_necesario}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Diálogo de edición */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Editar Rutina</DialogTitle>
        <DialogContent>
          <AddRutinaForm
            rutina={rutina}
            onRutinaCreated={handleRutinaUpdated}
            onClose={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de asignación */}
      <Dialog
        open={asignarDialogOpen}
        onClose={() => setAsignarDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Asignar Rutina a Cliente</DialogTitle>
        <DialogContent>
          <AsignarRutinaForm
            rutina={rutina}
            onAsignacionCompletada={handleAsignacionCompletada}
            onClose={() => setAsignarDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la rutina "{rutina.nombre}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DetalleRutina;
