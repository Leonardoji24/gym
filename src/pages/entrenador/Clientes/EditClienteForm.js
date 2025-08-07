import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Grid, Alert,
  FormControl, InputLabel, Select, Checkbox, FormControlLabel,
  FormGroup, CircularProgress, Snackbar, IconButton, Autocomplete, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import { format, addDays } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';

// Lista de condiciones médicas comunes
const condicionesComunes = [
  'Hipertensión arterial',
  'Diabetes mellitus',
  'Asma',
  'Artritis',
  'Osteoporosis',
  'Problemas de espalda',
  'Lesiones de rodilla',
  'Problemas cardíacos',
  'Obesidad',
  'Ansiedad/Depresión',
  'Fibromialgia',
  'Hernia discal',
  'Problemas de hombro',
  'Lesiones deportivas previas',
  'Problemas de circulación',
  'Epilepsia',
  'Alergias severas',
  'Problemas de tiroides',
  'Colesterol alto',
  'Migrañas frecuentes'
];

// Opciones para los campos del formulario
const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const tipoMembresiaOptions = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'diario', label: 'Pase Diario' },
];

const duracionMembresia = {
  mensual: 30,
  trimestral: 90,
  semestral: 180,
  anual: 365,
  diario: 1
};

const EditClienteForm = ({ cliente, onSave, onCancel, loading = false }) => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha_nacimiento: null,
    genero: '',
    direccion: '',
    tipo_membresia: '',
    fecha_vencimiento_membresia: null,
    condiciones_medicas: [],
    observaciones: '',
    activo: true
  });

  const [errors, setErrors] = useState({});
  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        fecha_nacimiento: cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : null,
        genero: cliente.genero || '',
        direccion: cliente.direccion || '',
        tipo_membresia: cliente.tipo_membresia || cliente.tipoMembresia || '',
        fecha_vencimiento_membresia: cliente.fecha_vencimiento_membresia ? new Date(cliente.fecha_vencimiento_membresia) : null,
        condiciones_medicas: Array.isArray(cliente.condiciones_medicas) 
          ? cliente.condiciones_medicas 
          : (cliente.condiciones_medicas ? [cliente.condiciones_medicas] : []),
        observaciones: cliente.observaciones || '',
        activo: cliente.activo !== false
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'tipo_membresia') {
      // Actualizar la fecha de vencimiento cuando cambia el tipo de membresía
      const hoy = new Date();
      const fechaVencimiento = new Date(hoy);
      fechaVencimiento.setDate(hoy.getDate() + (duracionMembresia[value] || 30));

      setForm(prev => ({
        ...prev,
        [name]: value,
        fecha_vencimiento_membresia: fechaVencimiento
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setForm(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const agregarCondicionMedica = (value = null) => {
    const condicion = value || nuevaCondicion.trim();
    if (condicion === '') return;

    // Evitar duplicados
    if (!form.condiciones_medicas.includes(condicion)) {
      setForm(prev => ({
        ...prev,
        condiciones_medicas: [...prev.condiciones_medicas, condicion]
      }));
    }

    setNuevaCondicion('');
    setInputValue('');
  };

  const eliminarCondicionMedica = (index) => {
    setForm(prev => ({
      ...prev,
      condiciones_medicas: prev.condiciones_medicas.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.email?.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email inválido';
    if (!form.telefono?.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!form.fecha_nacimiento) newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    if (!form.genero) newErrors.genero = 'El género es requerido';
    if (!form.direccion?.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!form.tipo_membresia) newErrors.tipo_membresia = 'El tipo de membresía es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Calcular fecha de vencimiento si no está establecida
      let fechaVencimiento = form.fecha_vencimiento_membresia;

      // Si hay un tipo de membresía pero no hay fecha de vencimiento, calcularla
      if (!fechaVencimiento && form.tipo_membresia) {
        const diasDuracion = duracionMembresia[form.tipo_membresia];
        if (diasDuracion) {
          fechaVencimiento = addDays(new Date(), diasDuracion);
        }
      }

      const formData = {
        ...form,
        fecha_nacimiento: form.fecha_nacimiento ? format(form.fecha_nacimiento, 'yyyy-MM-dd') : null,
        fecha_vencimiento_membresia: fechaVencimiento ? format(new Date(fechaVencimiento), 'yyyy-MM-dd') : null,
        condiciones_medicas: Array.isArray(form.condiciones_medicas) ? form.condiciones_medicas : []
      };
      onSave(formData);
    }
  };

  // Estilos reutilizables
  const formContainerStyle = {
    p: 3,
    background: 'white',
    borderRadius: 4,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
    maxWidth: 1000,
    width: '100%',
    mx: 'auto',
    border: '1px solid #e0e0e0',
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    '&:hover': {
      boxShadow: '0 6px 24px 0 rgba(0,0,0,0.12)'
    },
    '@media (max-height: 800px)': {
      maxHeight: '85vh'
    }
  };

  const formContentStyle = {
    overflowY: 'auto',
    pr: 1,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: '4px',
      '&:hover': {
        background: '#a8a8a8',
      },
    },
    scrollbarWidth: 'thin',
    scrollbarColor: '#c1c1c1 #f1f1f1',
  };

  const sectionTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#2c3e50',
    mb: 2,
    pb: 1,
    borderBottom: '2px solid #f0f2f5',
    letterSpacing: '0.3px'
  };

  const submitButtonStyle = {
    mt: 3,
    py: 1.5,
    px: 4,
    borderRadius: 2,
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'none',
    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)',
    '&:hover': {
      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
    },
    '&:active': {
      transform: 'translateY(1px)'
    },
    '&:disabled': {
      background: '#e0e0e0',
      color: '#9e9e9e',
      boxShadow: 'none'
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={handleSubmit} sx={formContainerStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{
            color: '#2c3e50',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2, #4a90e2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Editar Cliente
          </Typography>
          <IconButton onClick={onCancel} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={formContentStyle}>
          <Grid container spacing={3}>
            {/* Sección de Información Básica */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={sectionTitleStyle}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{
                    width: 6,
                    height: 24,
                    bgcolor: 'primary.main',
                    borderRadius: '0 4px 4px 0',
                    mr: 1.5,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                  }} />
                  Información Básica
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre Completo *"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre}
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono *"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                fullWidth
                error={!!errors.telefono}
                helperText={errors.telefono}
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Nacimiento *"
                value={form.fecha_nacimiento}
                onChange={handleDateChange('fecha_nacimiento')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.fecha_nacimiento}
                    helperText={errors.fecha_nacimiento}
                    size="medium"
                  />
                )}
                inputFormat="dd/MM/yyyy"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.genero}>
                <InputLabel>Género *</InputLabel>
                <Select
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  label="Género *"
                  size="medium"
                >
                  {generoOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.genero && <Typography color="error" variant="caption">{errors.genero}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Dirección *"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.direccion}
                helperText={errors.direccion}
                size="medium"
              />
            </Grid>

            {/* Sección de Membresía */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Typography variant="h6" sx={sectionTitleStyle}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{
                    width: 6,
                    height: 24,
                    bgcolor: 'secondary.main',
                    borderRadius: '0 4px 4px 0',
                    mr: 1.5,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                  }} />
                  Información de Membresía
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.tipo_membresia}>
                <InputLabel>Tipo de Membresía *</InputLabel>
                <Select
                  name="tipo_membresia"
                  value={form.tipo_membresia}
                  onChange={handleChange}
                  label="Tipo de Membresía *"
                  size="medium"
                >
                  {tipoMembresiaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipo_membresia && <Typography color="error" variant="caption">{errors.tipo_membresia}</Typography>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Vencimiento"
                value={form.fecha_vencimiento_membresia}
                onChange={handleDateChange('fecha_vencimiento_membresia')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="medium"
                    helperText={form.tipo_membresia && form.fecha_vencimiento_membresia ? 
                      `Vencimiento: ${format(new Date(form.fecha_vencimiento_membresia), 'dd/MM/yyyy')}` : 
                      'Seleccione un tipo de membresía primero'}
                  />
                )}
              />
            </Grid>

            {/* Sección de Información Adicional */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Typography variant="h6" sx={sectionTitleStyle}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{
                    width: 6,
                    height: 24,
                    bgcolor: 'warning.main',
                    borderRadius: '0 4px 4px 0',
                    mr: 1.5,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                  }} />
                  Información Adicional
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Condiciones Médicas</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Autocomplete
                    freeSolo
                    options={condicionesComunes}
                    value={nuevaCondicion}
                    onChange={(event, newValue) => {
                      setNuevaCondicion(newValue || '');
                      if (newValue) {
                        agregarCondicionMedica(newValue);
                      }
                    }}
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                      setInputValue(newInputValue);
                      setNuevaCondicion(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Buscar o agregar condición médica"
                        fullWidth
                        size="small"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCondicionMedica())}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Typography>{option}</Typography>
                      </li>
                    )}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => agregarCondicionMedica()}
                    disabled={!nuevaCondicion.trim()}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Agregar
                  </Button>
                </Box>

                {form.condiciones_medicas.length > 0 && (
                  <Box sx={{ mt: 1, maxHeight: 150, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                    {form.condiciones_medicas.map((condicion, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          bgcolor: '#f5f5f5',
                          borderRadius: 1,
                          mb: 0.5
                        }}
                      >
                        <Typography>{condicion}</Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => eliminarCondicionMedica(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
                <Typography variant="caption" color="textSecondary">
                  Agregue todas las condiciones médicas relevantes
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                size="medium"
                helperText="Observaciones adicionales sobre el cliente"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.activo}
                    onChange={handleChange}
                    name="activo"
                    color="primary"
                  />
                }
                label="Cliente Activo"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={submitButtonStyle}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EditClienteForm; 