import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  ContentCopy as ContentCopyIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { 
  getCategoriasEjercicios, 
  getEjercicios, 
  createRutina, 
  updateRutina,
  NIVELES, 
  OBJETIVOS, 
  TIPOS_EJERCICIO 
} from '../../services/rutinasService';

const AddRutinaForm = ({ rutina = null, onRutinaCreated, onClose }) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    nivel: 'principiante',
    objetivo: 'salud_general',
    duracion_semanas: 4,
    frecuencia_semanal: 3,
    tiempo_estimado: '',
    equipamiento_necesario: '',
    calorias_estimadas: '',
    es_plantilla: false,
    dias: []
  });

  const [categorias, setCategorias] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [ejerciciosFiltrados, setEjerciciosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEjerciciosDialog, setShowEjerciciosDialog] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [ejerciciosSugeridos, setEjerciciosSugeridos] = useState([]);

  useEffect(() => {
    if (rutina) {
      setForm({
        nombre: rutina.nombre || '',
        descripcion: rutina.descripcion || '',
        nivel: rutina.nivel || 'principiante',
        objetivo: rutina.objetivo || 'salud_general',
        duracion_semanas: rutina.duracion_semanas || 4,
        frecuencia_semanal: rutina.frecuencia_semanal || 3,
        tiempo_estimado: rutina.tiempo_estimado || '',
        equipamiento_necesario: rutina.equipamiento_necesario || '',
        calorias_estimadas: rutina.calorias_estimadas || '',
        es_plantilla: rutina.es_plantilla || false,
        dias: rutina.dias ? [...rutina.dias] : []
      });
    }
    cargarDatos();
  }, [rutina]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [categoriasData, ejerciciosData] = await Promise.all([
        getCategoriasEjercicios(),
        getEjercicios()
      ]);
      setCategorias(categoriasData);
      setEjercicios(ejerciciosData);
      setEjerciciosFiltrados(ejerciciosData);
    } catch (error) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addDia = () => {
    const nuevoDia = {
      id: Date.now(),
      nombre: `Día ${form.dias.length + 1}`,
      descripcion: '',
      orden: form.dias.length + 1,
      ejercicios: []
    };
    setForm(prev => ({ ...prev, dias: [...prev.dias, nuevoDia] }));
  };

  const removeDia = (diaIndex) => {
    setForm(prev => ({
      ...prev,
      dias: prev.dias.filter((_, index) => index !== diaIndex)
    }));
  };

  const updateDia = (diaIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      dias: prev.dias.map((dia, index) => 
        index === diaIndex ? { ...dia, [field]: value } : dia
      )
    }));
  };

  const addEjercicioToDia = (diaIndex, ejercicio) => {
    const nuevoEjercicio = {
      ejercicio_id: ejercicio.id,
      ejercicio_nombre: ejercicio.nombre,
      ejercicio_descripcion: ejercicio.descripcion,
      series: 3,
      repeticiones: '10-12',
      peso: 'sin peso',
      tiempo_ejercicio: null,
      tiempo_descanso: 60,
      orden: 1,
      notas: ''
    };

    setForm(prev => ({
      ...prev,
      dias: prev.dias.map((dia, index) => 
        index === diaIndex 
          ? { ...dia, ejercicios: [...dia.ejercicios, nuevoEjercicio] }
          : dia
      )
    }));
    setShowEjerciciosDialog(false);
  };

  const removeEjercicioFromDia = (diaIndex, ejercicioIndex) => {
    setForm(prev => ({
      ...prev,
      dias: prev.dias.map((dia, index) => 
        index === diaIndex 
          ? { ...dia, ejercicios: dia.ejercicios.filter((_, ejIndex) => ejIndex !== ejercicioIndex) }
          : dia
      )
    }));
  };

  const updateEjercicioInDia = (diaIndex, ejercicioIndex, field, value) => {
    setForm(prev => ({
      ...prev,
      dias: prev.dias.map((dia, index) => 
        index === diaIndex 
          ? { 
              ...dia, 
              ejercicios: dia.ejercicios.map((ej, ejIndex) => 
                ejIndex === ejercicioIndex 
                  ? { ...ej, [field]: value }
                  : ej
              )
            }
          : dia
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (rutina) {
        await updateRutina(rutina.id, form);
        setSuccess('Rutina actualizada exitosamente');
      } else {
        await createRutina(form);
        setSuccess('Rutina creada exitosamente');
      }

      setTimeout(() => {
        onRutinaCreated();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const filtrarEjercicios = (categoriaId) => {
    if (categoriaId) {
      setEjerciciosFiltrados(ejercicios.filter(ej => ej.categoria_id === categoriaId));
    } else {
      setEjerciciosFiltrados(ejercicios);
    }
  };

  const generarSugerencias = () => {
    const ejerciciosPorObjetivo = {
      'perdida_peso': ejercicios.filter(ej => ej.tipo_ejercicio === 'cardio'),
      'ganancia_muscular': ejercicios.filter(ej => ej.tipo_ejercicio === 'fuerza'),
      'resistencia': ejercicios.filter(ej => ej.tipo_ejercicio === 'cardio' || ej.tipo_ejercicio === 'fuerza'),
      'fuerza': ejercicios.filter(ej => ej.tipo_ejercicio === 'fuerza'),
      'flexibilidad': ejercicios.filter(ej => ej.tipo_ejercicio === 'flexibilidad'),
      'salud_general': ejercicios.slice(0, 10)
    };
    
    setEjerciciosSugeridos(ejerciciosPorObjetivo[form.objetivo] || []);
  };

  const exportarRutina = () => {
    const rutinaData = {
      ...form,
      fecha_exportacion: new Date().toISOString(),
      total_ejercicios: form.dias.reduce((total, dia) => total + dia.ejercicios.length, 0)
    };
    
    const blob = new Blob([JSON.stringify(rutinaData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.nombre.replace(/\s+/g, '_')}_rutina.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const duplicarRutina = () => {
    const rutinaDuplicada = {
      ...form,
      nombre: `${form.nombre} (Copia)`,
      dias: form.dias.map(dia => ({
        ...dia,
        id: Date.now() + Math.random(),
        ejercicios: dia.ejercicios.map(ej => ({ ...ej }))
      }))
    };
    setForm(rutinaDuplicada);
    setSuccess('Rutina duplicada. Puedes editar la copia.');
  };

  const validarRutina = () => {
    const errores = [];
    
    if (!form.nombre.trim()) errores.push('El nombre es requerido');
    if (form.dias.length === 0) errores.push('Debe tener al menos un día de entrenamiento');
    
    form.dias.forEach((dia, diaIndex) => {
      if (!dia.nombre.trim()) errores.push(`El día ${diaIndex + 1} debe tener un nombre`);
      if (dia.ejercicios.length === 0) errores.push(`El día ${diaIndex + 1} debe tener al menos un ejercicio`);
    });

    return errores;
  };

  const errores = validarRutina();

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header con acciones */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {rutina ? 'Editar Rutina' : 'Nueva Rutina'}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Vista previa">
            <IconButton onClick={() => setShowPreview(true)} color="primary">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicar rutina">
            <IconButton onClick={duplicarRutina} color="secondary">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar">
            <IconButton onClick={exportarRutina} color="info">
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Información básica */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información Básica
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de la rutina"
                value={form.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descripción"
                value={form.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={form.nivel}
                  onChange={(e) => handleInputChange('nivel', e.target.value)}
                  label="Nivel"
                >
                  {NIVELES.map(nivel => (
                    <MenuItem key={nivel.value} value={nivel.value}>
                      {nivel.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Objetivo</InputLabel>
                <Select
                  value={form.objetivo}
                  onChange={(e) => {
                    handleInputChange('objetivo', e.target.value);
                    generarSugerencias();
                  }}
                  label="Objetivo"
                >
                  {OBJETIVOS.map(objetivo => (
                    <MenuItem key={objetivo.value} value={objetivo.value}>
                      {objetivo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duración (semanas)"
                type="number"
                value={form.duracion_semanas}
                onChange={(e) => handleInputChange('duracion_semanas', parseInt(e.target.value))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Frecuencia semanal"
                type="number"
                value={form.frecuencia_semanal}
                onChange={(e) => handleInputChange('frecuencia_semanal', parseInt(e.target.value))}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tiempo estimado (minutos)"
                type="number"
                value={form.tiempo_estimado}
                onChange={(e) => handleInputChange('tiempo_estimado', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Calorías estimadas"
                type="number"
                value={form.calorias_estimadas}
                onChange={(e) => handleInputChange('calorias_estimadas', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Equipamiento necesario"
                value={form.equipamiento_necesario}
                onChange={(e) => handleInputChange('equipamiento_necesario', e.target.value)}
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Ejercicios sugeridos */}
      {ejerciciosSugeridos.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ejercicios Sugeridos para {OBJETIVOS.find(o => o.value === form.objetivo)?.label}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {ejerciciosSugeridos.slice(0, 8).map(ejercicio => (
                <Chip
                  key={ejercicio.id}
                  label={ejercicio.nombre}
                  onClick={() => {
                    if (form.dias.length > 0) {
                      addEjercicioToDia(0, ejercicio);
                    }
                  }}
                  clickable
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Días de entrenamiento */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Días de Entrenamiento ({form.dias.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addDia}
            >
              Agregar Día
            </Button>
          </Box>

          {form.dias.map((dia, diaIndex) => (
            <Accordion key={dia.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {dia.nombre}
                  </Typography>
                  <Chip 
                    label={`${dia.ejercicios.length} ejercicios`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDia(diaIndex);
                    }}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del día"
                      value={dia.nombre}
                      onChange={(e) => updateDia(diaIndex, 'nombre', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      value={dia.descripcion}
                      onChange={(e) => updateDia(diaIndex, 'descripcion', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1">
                        Ejercicios ({dia.ejercicios.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setCategoriaSeleccionada('');
                          setEjerciciosFiltrados(ejercicios);
                          setShowEjerciciosDialog(true);
                        }}
                      >
                        Agregar Ejercicio
                      </Button>
                    </Box>

                    {dia.ejercicios.map((ejercicio, ejercicioIndex) => (
                      <Card key={ejercicioIndex} sx={{ mb: 2, p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flexGrow={1}>
                            <Typography variant="subtitle2" gutterBottom>
                              {ejercicio.ejercicio_nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {ejercicio.ejercicio_descripcion}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Series"
                                  type="number"
                                  value={ejercicio.series}
                                  onChange={(e) => updateEjercicioInDia(diaIndex, ejercicioIndex, 'series', parseInt(e.target.value))}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Repeticiones"
                                  value={ejercicio.repeticiones}
                                  onChange={(e) => updateEjercicioInDia(diaIndex, ejercicioIndex, 'repeticiones', e.target.value)}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Peso"
                                  value={ejercicio.peso}
                                  onChange={(e) => updateEjercicioInDia(diaIndex, ejercicioIndex, 'peso', e.target.value)}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label="Descanso (s)"
                                  type="number"
                                  value={ejercicio.tiempo_descanso}
                                  onChange={(e) => updateEjercicioInDia(diaIndex, ejercicioIndex, 'tiempo_descanso', parseInt(e.target.value))}
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                            <TextField
                              fullWidth
                              label="Notas"
                              value={ejercicio.notas}
                              onChange={(e) => updateEjercicioInDia(diaIndex, ejercicioIndex, 'notas', e.target.value)}
                              size="small"
                              margin="normal"
                            />
                          </Box>
                          <IconButton
                            onClick={() => removeEjercicioFromDia(diaIndex, ejercicioIndex)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Card>
                    ))}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Validación */}
      {errores.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Errores de validación:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errores.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Botones de acción */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || errores.length > 0}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Guardando...' : (rutina ? 'Actualizar' : 'Crear')}
        </Button>
      </Box>

      {/* Diálogo de selección de ejercicios */}
      <Dialog 
        open={showEjerciciosDialog} 
        onClose={() => setShowEjerciciosDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Seleccionar Ejercicio</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoriaSeleccionada}
              onChange={(e) => {
                setCategoriaSeleccionada(e.target.value);
                filtrarEjercicios(e.target.value);
              }}
              label="Categoría"
            >
              <MenuItem value="">Todas las categorías</MenuItem>
              {categorias.map(categoria => (
                <MenuItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <List sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            {ejerciciosFiltrados.map(ejercicio => (
              <ListItem key={ejercicio.id} button onClick={() => addEjercicioToDia(form.dias.length - 1, ejercicio)}>
                <ListItemText
                  primary={ejercicio.nombre}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {ejercicio.descripcion}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip label={ejercicio.categoria_nombre} size="small" />
                        <Chip label={ejercicio.tipo_ejercicio} size="small" variant="outlined" />
                        <Chip label={ejercicio.nivel} size="small" variant="outlined" />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEjerciciosDialog(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddRutinaForm;
