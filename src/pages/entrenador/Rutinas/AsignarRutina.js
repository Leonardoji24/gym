import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox, 
  ListItemIcon, 
  Divider, 
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon,
  FitnessCenter as FitnessCenterIcon,
  Person as PersonIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { getRutinaDetalle } from '../../../services/rutinasService';
import { getClientes } from '../../../services/clientesService';
import { useAuth } from '../../../contexts/AuthContext';

const AsignarRutina = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rutina, setRutina] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar datos de la rutina y clientes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de la rutina
        const rutinaData = await getRutinaDetalle(id);
        setRutina(rutinaData);
        
        // Obtener lista de clientes
        const clientesData = await getClientes();
        setClientes(clientesData);
        
        // Si la rutina ya tiene clientes asignados, marcarlos como seleccionados
        if (rutinaData.clientes && rutinaData.clientes.length > 0) {
          const idsClientesAsignados = rutinaData.clientes.map(c => c.id);
          setClientesSeleccionados(idsClientesAsignados);
        }
        
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [id]);

  // Manejar selección/deselección de clientes
  const handleToggleCliente = (clienteId) => (event) => {
    event.stopPropagation();
    setClientesSeleccionados(prev => {
      const existe = prev.includes(clienteId);
      if (existe) {
        return prev.filter(id => id !== clienteId);
      } else {
        return [...prev, clienteId];
      }
    });
  };

  // Guardar asignaciones
  const guardarAsignaciones = async () => {
    try {
      setSaving(true);
      
      // Llamar a la API para guardar las asignaciones
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Procesar asignaciones una por una para manejar errores individuales
      const resultados = [];
      const errores = [];
      
      for (const clienteId of clientesSeleccionados) {
        try {
          const endpoint = apiUrl.endsWith('/api') ? 
            `${apiUrl}/rutinas/${id}/asignar` : 
            `${apiUrl}/api/rutinas/${id}/asignar`;
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
              cliente_id: clienteId,
              fecha_inicio: new Date().toISOString().split('T')[0],
              notas: `Asignación automática - ${new Date().toLocaleDateString()}`
            }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const cliente = clientes.find(c => c.id === clienteId);
            const nombreCliente = cliente ? cliente.nombre : `Cliente ${clienteId}`;
            errores.push(`${nombreCliente}: ${errorData.error || 'Error al asignar'}`);
          } else {
            const resultado = await response.json();
            resultados.push(resultado);
          }
        } catch (error) {
          const cliente = clientes.find(c => c.id === clienteId);
          const nombreCliente = cliente ? cliente.nombre : `Cliente ${clienteId}`;
          errores.push(`${nombreCliente}: ${error.message}`);
        }
      }
      
      // Mostrar resultados
      if (errores.length === 0) {
        setSnackbar({
          open: true,
          message: 'Todas las asignaciones se guardaron correctamente',
          severity: 'success'
        });
        
        // Forzar recarga de la página de rutinas
        navigate('/entrenador/rutinas', { 
          state: { shouldRefresh: true },
          replace: true 
        });
      } else if (resultados.length === 0) {
        // Todas fallaron
        setSnackbar({
          open: true,
          message: `Error en todas las asignaciones: ${errores.join(', ')}`,
          severity: 'error'
        });
      } else {
        // Algunas fallaron, algunas tuvieron éxito
        setSnackbar({
          open: true,
          message: `${resultados.length} asignaciones exitosas. Errores: ${errores.join(', ')}`,
          severity: 'warning'
        });
        
        // Recargar para mostrar los cambios
        setTimeout(() => {
          navigate('/entrenador/rutinas', { 
            state: { shouldRefresh: true },
            replace: true 
          });
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error al guardar las asignaciones:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error al guardar las asignaciones',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/entrenador/rutinas')}
        sx={{ mb: 3 }}
      >
        Volver a Rutinas
      </Button>
      
      {/* Detalles de la rutina */}
      <Card sx={{ mb: 4, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FitnessCenterIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
            <Typography variant="h5" component="h1">
              {rutina.nombre}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                {rutina.descripcion}
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Chip 
                  label={`Nivel: ${rutina.nivel}`} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`Objetivo: ${rutina.objetivo}`} 
                  color="secondary" 
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`Duración: ${rutina.duracion_semanas} semanas`} 
                  size="small"
                />
                <Chip 
                  label={`Frecuencia: ${rutina.frecuencia_semanal}x/semana`} 
                  size="small"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <PeopleIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Clientes asignados: {rutina.clientes?.length || 0}
                </Typography>
              </Box>
              
              {rutina.clientes && rutina.clientes.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {rutina.clientes.map(cliente => (
                    <Chip
                      key={cliente.id}
                      icon={<PersonIcon />}
                      label={`${cliente.nombre}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No hay clientes asignados a esta rutina.
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Lista de clientes para asignar */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Seleccionar Clientes
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Marque los clientes a los que desea asignar esta rutina.
        </Typography>
        
        {clientes.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {clientes.map((cliente) => (
              <div key={cliente.id}>
                <ListItem 
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    },
                    paddingRight: 2
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={clientesSeleccionados.includes(cliente.id)}
                      onChange={handleToggleCliente(cliente.id)}
                      onClick={(e) => e.stopPropagation()}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': `cliente-${cliente.id}` }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    id={`cliente-${cliente.id}`}
                    primary={`${cliente.nombre}`}
                    secondary={`${cliente.email} • ${cliente.telefono || 'Sin teléfono'}`}
                  />
                </ListItem>
                <Divider component="li" />
              </div>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
            No hay clientes disponibles para asignar.
          </Typography>
        )}
      </Paper>
      
      {/* Botones de acción */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button
          variant="outlined"
          onClick={() => navigate('/entrenador/rutinas')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={guardarAsignaciones}
          disabled={saving || clientesSeleccionados.length === 0}
        >
          {saving ? 'Guardando...' : 'Guardar Asignaciones'}
        </Button>
      </Box>
      
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

export default AsignarRutina;
