import React, { useState, useMemo } from 'react';
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

const initialState = {
  // Información básica
  nombre: '',
  email: '',
  telefono: '',
  fecha_inscripcion: new Date(),
  activo: true,
  rol_id: 3, // Por defecto es cliente (ID 3 según la base de datos)
  password: '',
  confirmPassword: '',

  // Información personal
  fecha_nacimiento: null,
  genero: '',
  direccion: '',

  // Información de membresía
  tipo_membresia: '',
  fecha_vencimiento_membresia: null,

  // Campos adicionales
  condiciones_medicas: [],
  observaciones: ''
};

const AddMemberForm = ({ onMemberCreated, memberData = null, mode = 'create' }) => {
  // Initialize form with memberData if in edit mode, otherwise use initialState
  const [form, setForm] = useState(() => {
    if (mode === 'edit' && memberData) {
      // Merge memberData with initialState to ensure all required fields are present
      const mergedData = {
        ...initialState,  // Start with default values
        ...memberData,    // Override with member data
        // Handle special fields
        fecha_nacimiento: memberData.fecha_nacimiento ? new Date(memberData.fecha_nacimiento) : null,
        fecha_vencimiento_membresia: memberData.fecha_vencimiento_membresia 
          ? new Date(memberData.fecha_vencimiento_membresia) 
          : null,
        // Ensure condiciones_medicas is an array
        condiciones_medicas: Array.isArray(memberData.condiciones_medicas) 
          ? memberData.condiciones_medicas 
          : (memberData.condiciones_medicas ? [memberData.condiciones_medicas] : [])
      };
      return mergedData;
    }
    return { ...initialState };
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'tipo_membresia') {
      // Actualizar la fecha de vencimiento cuando cambia el tipo de membresía
      const hoy = new Date();
      const fechaVencimiento = new Date(hoy);
      fechaVencimiento.setDate(hoy.getDate() + (duracionMembresia[value] || 30));

      console.log('Cambiando tipo de membresía a:', value);
      console.log('Duración en días:', duracionMembresia[value]);
      console.log('Nueva fecha de vencimiento:', fechaVencimiento);

      setForm(prev => ({
        ...prev,
        [name]: value,
        fecha_vencimiento_membresia: fechaVencimiento
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date, field) => {
    setForm(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [inputValue, setInputValue] = useState('');

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
    
    // Only validate password fields in create mode or when password is being changed
    if (mode !== 'edit' || form.password) {
      if (!form.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (form.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      console.log('Validación fallida');
      return;
    }

    setLoading(true);

    try {
      // Calcular fecha de vencimiento si no está establecida
      let fechaVencimiento = form.fecha_vencimiento_membresia;

      // Si hay un tipo de membresía pero no hay fecha de vencimiento, calcularla
      if (!fechaVencimiento && form.tipo_membresia) {
        const diasDuracion = duracionMembresia[form.tipo_membresia];
        if (diasDuracion) {
          fechaVencimiento = addDays(new Date(), diasDuracion);
          console.log('Fecha de vencimiento calculada:', fechaVencimiento);
        }
      }

      // Preparar los datos para enviar al backend
      const memberData = {
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        fecha_inscripcion: form.fecha_inscripcion ?
          format(new Date(form.fecha_inscripcion), 'yyyy-MM-dd') :
          format(new Date(), 'yyyy-MM-dd'),
        activo: form.activo,
        rol_id: form.rol_id,
        password: form.password,
        fecha_nacimiento: form.fecha_nacimiento ?
          format(new Date(form.fecha_nacimiento), 'yyyy-MM-dd') : null,
        genero: form.genero,
        direccion: form.direccion.trim(),
        tipo_membresia: form.tipo_membresia,
        condiciones_medicas: Array.isArray(form.condiciones_medicas) ? form.condiciones_medicas :
          (form.condiciones_medicas ? [form.condiciones_medicas.trim()] : []),
        observaciones: form.observaciones.trim(),
        fecha_vencimiento_membresia: fechaVencimiento 
          ? format(new Date(fechaVencimiento), 'yyyy-MM-dd')
          : null,
      };

          // Only include password if it's being set or changed
      if (mode === 'edit' && !form.password) {
        delete memberData.password;
        delete memberData.confirmPassword;
      }

      // Get authentication token
      const token = localStorage.getItem('token');
      const url = mode === 'edit' 
        ? `${process.env.REACT_APP_API_URL}/miembros/${form.id}`
        : `${process.env.REACT_APP_API_URL}/miembros`;

      // Make the API request
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify(memberData)
      });

      const data = await response.json();

      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Estado de la respuesta:', response.status, response.statusText);
      console.log('Datos de la respuesta:', data);

      if (!response.ok) {
        // Intentar obtener el mensaje de error del backend
        const errorMessage = data.error || data.message || 'Error desconocido';
        console.error('Error en la respuesta del servidor:', errorMessage);
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      // Mostrar información relevante del miembro creado/actualizado
      if (data.miembro) {
        console.log('=== INFORMACIÓN DEL MIEMBRO ===');
        console.log('ID:', data.miembro.id);
        console.log('Nombre:', data.miembro.nombre);
        console.log('Tipo de membresía:', data.miembro.tipo_membresia);
        console.log('Fecha de vencimiento:', data.miembro.fecha_vencimiento_membresia);
      }

      // Mostrar mensaje de éxito
      setSuccess('¡Cliente registrado exitosamente!');

      // Resetear el formulario
      setForm(initialState);

      // Llamar a la función de callback si existe
      if (onMemberCreated && data.miembro) {
        onMemberCreated(data.miembro);
      }

      // Ocultar el mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(''), 5000);

    } catch (err) {
      console.error('Error al registrar el cliente:', err);
      // Mostrar mensaje de error más descriptivo
      const errorMessage = err.message.includes('NetworkError') ?
        'No se pudo conectar al servidor. Verifica tu conexión a internet.' :
        err.message || 'Ocurrió un error al procesar la solicitud.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Estilos reutilizables
  const formContainerStyle = {
    mb: 4,
    p: { xs: 2, sm: 4 },
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
    // Ajuste para Firefox
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

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused fieldset': {
        borderColor: '#4a90e2',
        boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)'
      },
      '&:hover fieldset': {
        borderColor: '#90caf9'
      }
    },
    '& .MuiInputLabel-root': {
      color: '#5f6b7c',
      '&.Mui-focused': {
        color: '#4a90e2'
      }
    }
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

  // Función para cerrar notificaciones
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setSuccess('');
  };

  // Acción para cerrar notificaciones
  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleCloseAlert}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={formContainerStyle}
      >
        <Box sx={formContentStyle}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              textAlign: 'center',
              color: '#2c3e50',
              fontWeight: 700,
              fontSize: { xs: '1.8rem', sm: '2rem' },
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #1976d2, #4a90e2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              pb: 1
            }}
          >
            Registro de Nuevo Cliente
          </Typography>

          {/* Notificaciones */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseAlert}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity="error"
              variant="filled"
              action={action}
              sx={{ width: '100%' }}
            >
              {error}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!success}
            autoHideDuration={5000}
            onClose={handleCloseAlert}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity="success"
              variant="filled"
              action={action}
              sx={{ width: '100%' }}
            >
              {success}
            </Alert>
          </Snackbar>

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
                helperText={errors.email || 'Se usará para el inicio de sesión'}
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

            <Grid item xs={12}>
              <DatePicker
                label="Fecha de Nacimiento *"
                value={form.fecha_nacimiento}
                onChange={(date) => handleDateChange(date, 'fecha_nacimiento')}
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
              <TextField
                label="Contraseña *"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                error={!!errors.password}
                helperText={errors.password || 'Mínimo 8 caracteres'}
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Confirmar Contraseña *"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                size="medium"
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
                onChange={(date) => handleDateChange(date, 'fecha_vencimiento_membresia')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="medium"
                    helperText={form.tipo_membresia ? 
                      `Vencimiento: ${format(new Date(form.fecha_vencimiento_membresia), 'dd/MM/yyyy')}` : 
                      'Seleccione un tipo de membresía primero'}
                  />
                )}
                readOnly
              />
            </Grid>

            {/* Sección de Seguridad */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Typography variant="h6" sx={sectionTitleStyle}>
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{
                    width: 6,
                    height: 24,
                    bgcolor: 'success.main',
                    borderRadius: '0 4px 4px 0',
                    mr: 1.5,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                  }} />
                  Seguridad
                </Box>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contraseña *"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                error={!!errors.password}
                helperText={errors.password || 'Mínimo 6 caracteres'}
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Confirmar Contraseña *"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                size="medium"
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
                rows={2}
                size="medium"
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

            {/* Botón de envío */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={submitButtonStyle}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Registrando...' : 'Registrar Cliente'}
              </Button>
            </Grid>
          </Grid>
        </Box> {/* Cierre del contenedor de scroll */}
      </Box>
    </LocalizationProvider>
  );
};

export default AddMemberForm;