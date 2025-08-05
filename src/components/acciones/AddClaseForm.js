import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Grid, Alert,
  FormControl, InputLabel, Select, MenuItem, Snackbar, IconButton,
  CircularProgress, FormHelperText
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';

const diasSemana = [
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
  { value: 'Sábado', label: 'Sábado' },
  { value: 'Domingo', label: 'Domingo' },
];

const initialState = {
  nombre: '',
  descripcion: '',
  dia_semana: '',
  hora_inicio: null,
  duracion: 60, // duración en minutos
  cupo_maximo: 20,
  id_entrenador: ''
};

const AddClaseForm = ({ onClose, onClassCreated, entrenadores = [], clase = null }) => {
  const [form, setForm] = useState(clase ? {
    nombre: clase.nombre || '',
    descripcion: clase.descripcion || '',
    dia_semana: clase.horario ? clase.horario.split(' ')[0] : '',
    hora_inicio: clase.horario ? (() => {
      const parts = clase.horario.split(' ');
      if (parts.length > 1) {
        const [hour, minute] = parts[1].split(':');
        const date = new Date();
        date.setHours(Number(hour), Number(minute), 0, 0);
        return date;
      }
      return null;
    })() : null,
    duracion: clase.duracion || 60,
    cupo_maximo: clase.cupoMaximo || 20,
    id_entrenador: clase.id_entrenador || ''
  } : initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efecto para verificar los entrenadores cargados
  useEffect(() => {
    console.log('Entrenadores recibidos en el formulario:', entrenadores);

    if (entrenadores && entrenadores.length > 0) {
      // Verificar que los entrenadores tengan el formato correcto
      const entrenadoresFormateados = entrenadores.map(entrenador => ({
        id_miembro: entrenador.id_miembro || entrenador.id,
        nombre: entrenador.nombre || 'Sin nombre',
        apellido: entrenador.apellido || ''
      }));

      console.log('Entrenadores formateados para el selector:', entrenadoresFormateados);
    } else {
      console.warn('No se recibieron entrenadores o el array está vacío');
    }
  }, [entrenadores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (time, field) => {
    setForm(prev => ({
      ...prev,
      [field]: time
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.dia_semana) newErrors.dia_semana = 'El día de la semana es requerido';
    if (!form.hora_inicio) newErrors.hora_inicio = 'La hora de inicio es requerida';
    if (!form.duracion) newErrors.duracion = 'La duración es requerida';
    else if (form.duracion < 15) newErrors.duracion = 'La duración mínima es de 15 minutos';
    if (!form.cupo_maximo) newErrors.cupo_maximo = 'El cupo máximo es requerido';
    else if (form.cupo_maximo < 1) newErrors.cupo_maximo = 'El cupo debe ser al menos 1';
    if (!form.id_entrenador) newErrors.id_entrenador = 'Debe seleccionar un entrenador';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Formatear la hora para el envío al backend
      const horaFormateada = form.hora_inicio ?
        form.hora_inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

      const classData = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        horario: `${form.dia_semana} ${horaFormateada}`,
        cupo_maximo: Number(form.cupo_maximo),
        id_entrenador: Number(form.id_entrenador),
        duracion: Number(form.duracion)
      };

      console.log('Datos a enviar al servidor:', classData);

      if (clase && clase.id) {
        // Modo edición
        await api.put(`/clases/${clase.id}`, classData);
        setSuccess('Clase actualizada exitosamente');
      } else {
        // Modo creación
        await api.post('/clases', classData);
        setSuccess('Clase registrada exitosamente');
      }
      if (onClassCreated) onClassCreated();

      setTimeout(() => {
        setForm(initialState);
        if (onClose) onClose();
      }, 1200);

    } catch (err) {
      console.error('Error al guardar la clase:', err);
      const errorMessage = err.response?.data?.message || 'Error al guardar la clase';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        mt: 2,
        background: '#fff',
        borderRadius: 3,
        boxShadow: 8,
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
        {clase ? 'Editar Clase' : 'Registrar Nueva Clase'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre de la clase *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={!!errors.nombre}
            helperText={errors.nombre}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth margin="normal" required error={!!errors.dia_semana}>
            <InputLabel>Día de la semana</InputLabel>
            <Select
              name="dia_semana"
              value={form.dia_semana}
              onChange={handleChange}
              label="Día de la semana"
            >
              {diasSemana.map((dia) => (
                <MenuItem key={dia.value} value={dia.value}>
                  {dia.label}
                </MenuItem>
              ))}
            </Select>
            {errors.dia_semana && (
              <FormHelperText>{errors.dia_semana}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <TimePicker
              label="Hora de inicio"
              value={form.hora_inicio}
              onChange={(time) => handleTimeChange(time, 'hora_inicio')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  error={!!errors.hora_inicio}
                  helperText={errors.hora_inicio}
                  required
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Duración (minutos) *"
            name="duracion"
            type="number"
            value={form.duracion}
            onChange={handleChange}
            error={!!errors.duracion}
            helperText={errors.duracion || 'Duración en minutos'}
            margin="normal"
            inputProps={{ min: 15, step: 15 }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Cupo máximo *"
            name="cupo_maximo"
            type="number"
            value={form.cupo_maximo}
            onChange={handleChange}
            error={!!errors.cupo_maximo}
            helperText={errors.cupo_maximo}
            margin="normal"
            inputProps={{ min: 1 }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl fullWidth margin="normal" required error={!!errors.id_entrenador} sx={{ minWidth: 340 }}>
            <InputLabel>Entrenador</InputLabel>
            <Select
              name="id_entrenador"
              value={form.id_entrenador}
              onChange={handleChange}
              label="Entrenador"
            >
              <MenuItem value="">
                <em>Seleccionar entrenador</em>
              </MenuItem>
              {entrenadores.map((entrenador) => (
                <MenuItem key={entrenador.id_miembro} value={entrenador.id_miembro}>
                  {`${entrenador.nombre} ${entrenador.apellido || ''}`.trim()}
                </MenuItem>
              ))}
            </Select>
            {errors.id_entrenador && (
              <FormHelperText>{errors.id_entrenador}</FormHelperText>
            )}
          </FormControl>
        </Grid>









      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || isSubmitting}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {clase
            ? (loading ? 'Guardando...' : 'Guardar Cambios')
            : (loading ? 'Registrando...' : 'Registrar Clase')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddClaseForm;
