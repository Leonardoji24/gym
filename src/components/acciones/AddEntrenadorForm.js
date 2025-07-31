import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Grid, Alert,
  FormControl, InputLabel, Select, MenuItem, Snackbar, IconButton,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import es from 'date-fns/locale/es';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const initialState = {
  // Información básica
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha_nacimiento: null,
  genero: '',
  direccion: '',
  especialidad: '',
  fecha_contratacion: new Date(),
  activo: true,
  password: '',
  confirmPassword: '',
};

const AddEntrenadorForm = ({ onClose, onTrainerCreated }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setForm(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.apellido?.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!form.email?.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email inválido';
    if (!form.telefono?.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!form.fecha_nacimiento) newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    if (!form.genero) newErrors.genero = 'El género es requerido';
    if (!form.direccion?.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!form.especialidad?.trim()) newErrors.especialidad = 'La especialidad es requerida';
    if (!form.password) newErrors.password = 'La contraseña es requerida';
    else if (form.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const trainerData = {
        ...form,
        rol_id: 2, // ID para entrenadores
        fecha_nacimiento: form.fecha_nacimiento?.toISOString().split('T')[0],
        fecha_contratacion: form.fecha_contratacion?.toISOString().split('T')[0],
      };

      const response = await api.post('/miembros', trainerData);
      
      setSuccess('Entrenador registrado exitosamente');
      if (onTrainerCreated) onTrainerCreated();
      
      // Reset form after successful submission
      setTimeout(() => {
        setForm(initialState);
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error al registrar entrenador:', err);
      const errorMessage = err.response?.data?.message || 'Error al registrar el entrenador';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre"
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
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            error={!!errors.apellido}
            helperText={errors.apellido}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            error={!!errors.telefono}
            helperText={errors.telefono}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Nacimiento"
              value={form.fecha_nacimiento}
              onChange={(date) => handleDateChange(date, 'fecha_nacimiento')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  error={!!errors.fecha_nacimiento}
                  helperText={errors.fecha_nacimiento}
                  required
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" required error={!!errors.genero}>
            <InputLabel>Género</InputLabel>
            <Select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              label="Género"
            >
              {generoOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.genero && (
              <Typography color="error" variant="caption" display="block" gutterBottom>
                {errors.genero}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            error={!!errors.direccion}
            helperText={errors.direccion}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Especialidad"
            name="especialidad"
            value={form.especialidad}
            onChange={handleChange}
            error={!!errors.especialidad}
            helperText={errors.especialidad}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Contratación"
              value={form.fecha_contratacion}
              onChange={(date) => handleDateChange(date, 'fecha_contratacion')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            margin="normal"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            margin="normal"
            required
          />
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Registrando...' : 'Registrar Entrenador'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddEntrenadorForm;
