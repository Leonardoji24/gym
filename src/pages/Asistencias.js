import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Box, TextField, MenuItem, Dialog,
  DialogActions, DialogContent, DialogTitle, DialogContentText,
  Autocomplete
} from '@mui/material';
import { Add, ExitToApp, Search, PersonSearch } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [miembros, setMiembros] = useState([]);
  const [asistenciasFiltradas, setAsistenciasFiltradas] = useState(asistencias);

  const [nuevaAsistencia, setNuevaAsistencia] = useState({
    miembro_id: '',
    tipo_asistencia: 'entrenamiento',
    notas: ''
  });
  const navigate = useNavigate();

  // Obtener el token del localStorage
  const token = localStorage.getItem('token');

  // Configurar axios para incluir el token en las peticiones
  const api = axios.create({
    baseURL: 'http://192.168.1.135:3306/api',
    headers: {
      'Authorization': token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json'
    }
  });

  // Cargar asistencias
  const cargarAsistencias = async () => {
    try {
      const response = await api.get('/asistencias');
      setAsistencias(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setLoading(false);
    }
  };

  // Cargar miembros
  const cargarMiembros = async () => {
    try {
      const response = await api.get('/miembros');
      setMiembros(response.data);
    } catch (error) {
      console.error('Error al cargar miembros:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await Promise.all([
          cargarAsistencias(),
          cargarMiembros()
        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
    // Exponer función global para actualizar asistencias desde otras páginas
    window.actualizarAsistenciasTabla = cargarAsistencias;
    return () => {
      window.actualizarAsistenciasTabla = undefined;
    };
  }, []);


  // Obtener la asistencia de hoy para un miembro
  const getAsistenciaHoy = (miembroId) => {
    if (!miembroId || !Array.isArray(asistencias)) return null;
    
    const hoy = new Date().toISOString().split('T')[0];
    return asistencias.find(a => 
      a.miembro_id === miembroId && 
      a.fecha_hora_entrada && 
      a.fecha_hora_entrada.split('T')[0] === hoy
    ) || null;
  };

  // Manejar el registro de asistencia directa
  const handleMarcarAsistencia = async (miembro) => {
    if (!miembro || !miembro.id) {
      console.error('Miembro no válido:', miembro);
      alert('Error: No se pudo identificar al miembro');
      return;
    }

    try {
      await api.post('/asistencias', {
        miembro_id: miembro.id,
        tipo_asistencia: 'entrenamiento',
        notas: 'Asistencia registrada desde la tabla'
      });
      
      // Recargar asistencias después de un breve retraso
      setTimeout(() => {
        cargarAsistencias();
      }, 300);
      
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      alert('Error al registrar la asistencia: ' + (error.response?.data?.error || error.message));
    }
  };

  // Filtrar asistencias por búsqueda
  useEffect(() => {
    const filtered = asistencias.filter(asistencia => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (asistencia.miembro_nombre && asistencia.miembro_nombre.toLowerCase().includes(searchLower)) ||
        (asistencia.miembro_email && asistencia.miembro_email.toLowerCase().includes(searchLower)) ||
        (asistencia.tipo_asistencia && asistencia.tipo_asistencia.toLowerCase().includes(searchLower)) ||
        (asistencia.notas && asistencia.notas.toLowerCase().includes(searchLower))
      );
    });
    setAsistenciasFiltradas(filtered);
  }, [asistencias, searchTerm]);

  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    return format(new Date(fecha), "PPpp", { locale: es });
  };

  // Manejar el registro de salida
  const handleRegistrarSalida = async (asistencia) => {
    if (!asistencia || !asistencia.id) {
      console.error('Asistencia no válida:', asistencia);
      alert('Error: No se pudo identificar la asistencia');
      return;
    }

    try {
      await api.put(`/asistencias/${asistencia.id}/salida`);
      
      // Mostrar retroalimentación visual
      const button = document.querySelector(`button[data-asistencia-id="${asistencia.id}"]`);
      if (button) {
        button.disabled = true;
        button.innerHTML = '<CheckCircle color="success" /> Salida registrada';
      }
      
      // Recargar asistencias después de un breve retraso
      setTimeout(() => {
        cargarAsistencias();
      }, 300);
      
    } catch (error) {
      console.error('Error al registrar salida:', error);
      alert('Error al registrar la salida: ' + (error.response?.data?.error || error.message));
    }
  };

  // Filtrar asistencias basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setAsistenciasFiltradas(asistencias);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = asistencias.filter(asistencia => 
        (asistencia.miembro_nombre?.toLowerCase().includes(term) ||
         asistencia.miembro_email?.toLowerCase().includes(term) ||
         asistencia.tipo_asistencia?.toLowerCase().includes(term) ||
         asistencia.notas?.toLowerCase().includes(term))
      );
      setAsistenciasFiltradas(filtered);
    }
  }, [searchTerm, asistencias]);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un miembro
    if (!nuevaAsistencia.miembro_id) {
      alert('Por favor seleccione un miembro');
      return;
    }
    
    try {
      // Enviar solo el ID del miembro, no el objeto completo
      await api.post('/asistencias', {
        ...nuevaAsistencia,
        miembro_id: nuevaAsistencia.miembro_id.id
      });
      
      // Cerrar diálogo y resetear formulario
      setOpenDialog(false);
      setNuevaAsistencia({
        miembro_id: '',
        tipo_asistencia: 'entrenamiento',
        notas: ''
      });
      
      // Recargar la lista de asistencias
      cargarAsistencias();
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      alert('Error al registrar la asistencia: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div>Cargando asistencias...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Control de Asistencias</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Nueva Asistencia
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Buscar asistencias..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asistencia</TableCell>
              <TableCell>Miembro</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Salida</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(miembros) && miembros.length > 0 ? (
              miembros.map((miembro) => {
                if (!miembro || !miembro.id) return null;
                
                const asistenciaHoy = getAsistenciaHoy(miembro.id);
                const yaAsistio = !!asistenciaHoy;
                
                return (
                  <TableRow 
                    key={miembro.id}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      bgcolor: yaAsistio ? 'action.selected' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Button
                        id={`asistencia-btn-${miembro.id}`}
                        variant={yaAsistio ? 'contained' : 'outlined'}
                        color={yaAsistio ? 'success' : 'primary'}
                        size="small"
                        startIcon={yaAsistio ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                        disabled={yaAsistio}
                        onClick={() => handleMarcarAsistencia(miembro)}
                        title={yaAsistio ? 'Asistencia ya registrada' : 'Marcar asistencia'}
                        sx={{
                          minWidth: '100px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: yaAsistio ? 'none' : 'scale(1.05)'
                          }
                        }}
                      >
                        {yaAsistio ? '¡Asistió!' : 'Marcar'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ fontWeight: 500 }}>
                        {miembro.nombre} {miembro.apellido}
                      </Box>
                      <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {miembro.telefono || 'Sin teléfono'}
                      </Box>
                    </TableCell>
                    <TableCell>{miembro.email || '-'}</TableCell>
                    <TableCell>
                      {yaAsistio ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          {formatFecha(asistenciaHoy.fecha_hora_entrada)}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {yaAsistio ? (
                        asistenciaHoy.fecha_hora_salida ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                            {formatFecha(asistenciaHoy.fecha_hora_salida)}
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<ExitToApp />}
                            onClick={() => handleRegistrarSalida(asistenciaHoy)}
                            sx={{ whiteSpace: 'nowrap' }}
                            data-asistencia-id={asistenciaHoy.id}
                          >
                            Registrar Salida
                          </Button>
                        )
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {yaAsistio ? asistenciaHoy.tipo_asistencia : '-'}
                    </TableCell>
                    <TableCell>
                      {yaAsistio ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {asistenciaHoy.notas || 'Sin notas'}
                        </Box>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    color: 'text.secondary'
                  }}>
                    <PersonSearch sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="subtitle1">No hay miembros registrados</Typography>
                    <Typography variant="body2">Utiliza el botón "Nuevo Miembro" para comenzar</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para nueva asistencia */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Registrar Nueva Asistencia</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Busque y seleccione un miembro para registrar su asistencia
            </DialogContentText>
            <Autocomplete
              id="miembro-search"
              options={miembros}
              getOptionLabel={(option) => 
                typeof option === 'object' 
                  ? `${option.nombre} ${option.apellido} (${option.email || 'Sin email'})` 
                  : option
              }
              value={nuevaAsistencia.miembro_id}
              onChange={(event, newValue) => {
                setNuevaAsistencia({...nuevaAsistencia, miembro_id: newValue});
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="dense"
                  label="Buscar miembro"
                  variant="outlined"
                  placeholder="Escriba para buscar..."
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <PersonSearch sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              fullWidth
              noOptionsText="No se encontraron miembros"
            />

            <TextField
              select
              fullWidth
              margin="normal"
              label="Tipo de Asistencia"
              value={nuevaAsistencia.tipo_asistencia}
              onChange={(e) => setNuevaAsistencia({...nuevaAsistencia, tipo_asistencia: e.target.value})}
              required
            >
              <MenuItem value="entrenamiento">Entrenamiento</MenuItem>
              <MenuItem value="clase">Clase</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>

            <TextField
              fullWidth
              margin="normal"
              label="Notas (opcional)"
              multiline
              rows={3}
              value={nuevaAsistencia.notas}
              onChange={(e) => setNuevaAsistencia({...nuevaAsistencia, notas: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Registrar Asistencia
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
