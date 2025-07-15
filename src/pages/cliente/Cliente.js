import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Tabs,
  Tab,
  useMediaQuery
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  EventAvailable as EventAvailableIcon,
  BarChart as BarChartIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import clienteService from '../../services/api/clienteService';

// Componente para la pestaña de Resumen
const ResumenTab = ({ cliente }) => (
  <Box>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <FitnessCenterIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Membresía</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Tipo</Typography>
              <Typography variant="body1">{cliente.tipoMembresia || 'No especificado'}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">Estado</Typography>
              <Chip 
                label={cliente.estadoMembresia?.toUpperCase() || 'INACTIVO'} 
                color={cliente.estadoMembresia === 'activo' ? 'success' : 'error'} 
                size="small"
                variant="outlined"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Vencimiento</Typography>
              <Box display="flex" alignItems="center">
                <TodayIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {cliente.fechaVencimiento 
                    ? new Date(cliente.fechaVencimiento).toLocaleDateString('es-ES')
                    : 'No especificado'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <EventAvailableIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Próximas Clases</Typography>
            </Box>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <AccessTimeIcon color="primary" fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2">Clase de {['Funcional', 'Spinning', 'Yoga'][item-1]}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {['Lun 9:00 AM', 'Mie 7:00 PM', 'Vie 8:00 AM'][item-1]}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>Ver todas las clases</Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Progreso</Typography>
            </Box>
            <Box textAlign="center" py={2}>
              <Typography variant="h4" color="primary">85%</Typography>
              <Typography variant="body2" color="textSecondary">Objetivo mensual</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption">Asistencias</Typography>
                <Typography variant="caption">12/15</Typography>
              </Box>
              <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ width: '80%', height: '100%', bgcolor: 'primary.main' }} />
              </Box>
            </Box>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>Ver estadísticas</Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

// Componente para la pestaña de Perfil
const PerfilTab = ({ cliente }) => (
  <Card>
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar 
              src={cliente.foto} 
              sx={{ 
                width: 120, 
                height: 120, 
                fontSize: '3rem',
                mb: 2 
              }}
            >
              {cliente.nombre?.charAt(0)}{cliente.apellidoPaterno?.charAt(0)}
            </Avatar>
            <Button variant="outlined" size="small">Cambiar foto</Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Nombre</Typography>
              <Typography variant="body1" gutterBottom>{cliente.nombre || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Apellido Paterno</Typography>
              <Typography variant="body1" gutterBottom>{cliente.apellidoPaterno || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Apellido Materno</Typography>
              <Typography variant="body1" gutterBottom>{cliente.apellidoMaterno || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Email</Typography>
              <Typography variant="body1" gutterBottom>{cliente.email || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Teléfono</Typography>
              <Typography variant="body1" gutterBottom>{cliente.telefono || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Fecha de Nacimiento</Typography>
              <Typography variant="body1" gutterBottom>
                {cliente.fechaNacimiento 
                  ? new Date(cliente.fechaNacimiento).toLocaleDateString('es-ES')
                  : 'No especificado'}
              </Typography>
            </Grid>
          </Grid>
          <Box mt={3}>
            <Button variant="contained" color="primary">Editar perfil</Button>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// Componente para la pestaña de Rutinas
const RutinasTab = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Mis Rutinas</Typography>
      <Typography color="textSecondary" paragraph>
        Aquí podrás ver y gestionar tus rutinas de entrenamiento asignadas.
      </Typography>
      <Button variant="contained" color="primary">Ver rutinas</Button>
    </CardContent>
  </Card>
);

const Cliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [cliente, setCliente] = useState({
    id: id,
    nombre: 'Juan',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'Gómez',
    email: 'juan.perez@example.com',
    telefono: '1234567890',
    fechaNacimiento: '1990-05-15',
    tipoMembresia: 'Premium',
    estadoMembresia: 'activo',
    fechaVencimiento: '2023-12-31',
    foto: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        // Descomentar cuando el servicio esté listo
        // const data = await clienteService.getClienteById(id);
        // setCliente(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los datos del cliente:', error);
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    // Lógica para cerrar sesión
    navigate('/login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Cargando información del cliente...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Encabezado */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 3,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Hola, {cliente.nombre}
          </Typography>
          <Box display="flex" alignItems="center" mt={0.5}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: cliente.estadoMembresia === 'activo' ? 'success.main' : 'error.main',
                mr: 1 
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              {cliente.estadoMembresia === 'activo' ? 'Membresía activa' : 'Membresía inactiva'}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<SettingsIcon />}
            onClick={() => navigate(`/cliente/${id}/configuracion`)}
          >
            Configuración
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      {/* Notificaciones */}
      <Box sx={{ mb: 3 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: 'warning.light',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Tu membresía vence en 15 días. <strong>¡Renueva ahora!</strong>
          </Typography>
        </Paper>
      </Box>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Resumen" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Perfil" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Rutinas" icon={<FitnessCenterIcon />} iconPosition="start" />
          <Tab label="Asistencias" icon={<CheckCircleIcon />} iconPosition="start" />
          <Tab label="Pagos" icon={<EventAvailableIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Contenido de las pestañas */}
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && <ResumenTab cliente={cliente} />}
        {tabValue === 1 && <PerfilTab cliente={cliente} />}
        {tabValue === 2 && <RutinasTab />}
        {tabValue === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mis Asistencias</Typography>
              <Typography color="textSecondary">
                Aquí podrás ver tu historial de asistencias al gimnasio.
              </Typography>
            </CardContent>
          </Card>
        )}
        {tabValue === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mis Pagos</Typography>
              <Typography color="textSecondary">
                Historial de pagos y facturación.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Cliente;