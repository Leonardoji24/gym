import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { getClientes } from '../../services/clientesService';
import { asignarRutinaCliente, getClientesAsignados } from '../../services/rutinasService';

const AsignarRutinaForm = ({ rutina, onAsignacionCompletada, onClose }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientesAsignados, setClientesAsignados] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar clientes disponibles
        const clientesData = await getClientes('cliente');
        setClientes(clientesData);
        
        // Cargar clientes ya asignados
        const asignadosData = await getClientesAsignados(rutina.id);
        setClientesAsignados(asignadosData.clientes_asignados || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar la información');
      }
    };

    cargarDatos();
  }, [rutina.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clienteSeleccionado) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (!fechaInicio) {
      setError('Debe seleccionar una fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const asignacionData = {
        cliente_id: clienteSeleccionado.id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        notas: notas
      };

      await asignarRutinaCliente(rutina.id, asignacionData);
      
      setSuccess('Rutina asignada exitosamente');
      setTimeout(() => {
        onAsignacionCompletada();
      }, 2000);

    } catch (error) {
      console.error('Error al asignar rutina:', error);
      const errorMessage = error.response?.data?.error || 'Error al asignar la rutina';
      
      // Manejar específicamente el caso de rutina ya asignada
      if (errorMessage.includes('ya tiene esta rutina asignada')) {
        setError('Este cliente ya tiene esta rutina asignada activamente. Puede asignar la rutina a otro cliente o cancelar la asignación actual.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Asignar Rutina: {rutina?.nombre}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información de la Rutina
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>Nombre:</strong> {rutina?.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rutina?.descripcion}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Nivel: ${rutina?.nivel}`} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`Objetivo: ${rutina?.objetivo}`} 
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Seleccionar Cliente
              </Typography>
              <Autocomplete
                options={clientes}
                getOptionLabel={(option) => `${option.nombre}`}
                value={clienteSeleccionado}
                onChange={(event, newValue) => setClienteSeleccionado(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar cliente"
                    required
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.email} • {option.telefono || 'Sin teléfono'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de inicio"
                  value={fechaInicio}
                  onChange={(newValue) => setFechaInicio(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                    />
                  )}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas adicionales"
                multiline
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                fullWidth
                placeholder="Observaciones sobre la asignación..."
              />
            </Grid>

            {clienteSeleccionado && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Cliente Seleccionado
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">
                      <strong>Nombre:</strong> {clienteSeleccionado.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Email:</strong> {clienteSeleccionado.email}
                    </Typography>
                    {clienteSeleccionado.telefono && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Teléfono:</strong> {clienteSeleccionado.telefono}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {clientesAsignados.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="warning.main">
                  ⚠️ Clientes Ya Asignados
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Los siguientes clientes ya tienen esta rutina asignada activamente:
                </Alert>
                <Box>
                  {clientesAsignados.map((cliente) => (
                    <Chip
                      key={cliente.id}
                      label={`${cliente.nombre} (Asignado el ${new Date(cliente.fecha_inicio).toLocaleDateString()})`}
                      color="warning"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !clienteSeleccionado || !fechaInicio}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Asignando...' : 'Asignar Rutina'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarRutinaForm;
