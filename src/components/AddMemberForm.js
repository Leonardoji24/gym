import React, { useState } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Grid, Alert
} from '@mui/material';

const roles = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Entrenador' },
  { value: 4, label: 'Cliente' },
];

const planOptions = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'premium', label: 'Premium' },
];

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const condicionesFisicasOptions = [
  { value: 'ninguna', label: 'Ninguna' },
  { value: 'lesion_rodilla', label: 'Lesión de rodilla' },
  { value: 'lesion_espalda', label: 'Lesión de espalda' },
  { value: 'asma', label: 'Asma' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'embarazo', label: 'Embarazo' },
];

const fitnessGoalOptions = [
  { value: 'perder_peso', label: 'Perder peso' },
  { value: 'ganar_musculo', label: 'Ganar músculo' },
  { value: 'mantenerse', label: 'Mantenerse en forma' },
  { value: 'mejorar_salud', label: 'Mejorar salud' },
  { value: 'rendimiento', label: 'Mejorar rendimiento' },
];

const initialState = {
  nombre: '',
  apellidos: '',
  fecha_nacimiento: '',
  genero: '',
  email: '',
  telefono: '',
  plan: '',
  condiciones_fisicas: '',
  fitness_goal: '',
};

const AddMemberForm = ({ onMemberCreated }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setForm(prev => ({ ...initialState, rol_id: parseInt(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Aquí debes hacer la petición al backend para crear el miembro
      // Ejemplo:
      // await createMember(form);
      setSuccess('Miembro creado correctamente');
      setForm(initialState);
      if (onMemberCreated) onMemberCreated();
    } catch (err) {
      setError('No se pudo crear el miembro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 4, border: '2px solid #1976d2', borderRadius: 3, background: '#fafafa', maxWidth: 600, mx: 'auto', maxHeight: '80vh', overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Agregar Nuevo Cliente</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth required size="large" sx={{ fontSize: '1.2rem', mb: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} fullWidth required size="large" sx={{ fontSize: '1.2rem', mb: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Fecha de nacimiento" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} fullWidth required type="date" size="large" InputLabelProps={{ shrink: true }} sx={{ fontSize: '1.2rem', mb: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required type="email" size="large" sx={{ fontSize: '1.2rem', mb: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth required size="large" sx={{ fontSize: '1.2rem', mb: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <TextField select label="Plan seleccionado" name="plan" value={form.plan} onChange={handleChange} fullWidth required size="large"
  sx={{ fontSize: '1.2rem', mb: 2, minWidth: 300 }}
  InputProps={{ style: { fontSize: '1.2rem', minWidth: 300 } }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        style: { minWidth: 300 }
      }
    }
  }}
>
  {planOptions.map(plan => (
    <MenuItem key={plan.value} value={plan.value} sx={{ fontSize: '1.15rem', minWidth: 300, whiteSpace: 'normal' }}>{plan.label}</MenuItem>
  ))}
</TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField select label="Género" name="genero" value={form.genero} onChange={handleChange} fullWidth required size="large"
  sx={{ fontSize: '1.2rem', mb: 2, minWidth: 300 }}
  InputProps={{ style: { fontSize: '1.2rem', minWidth: 300 } }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        style: { minWidth: 300 }
      }
    }
  }}
>
  {generoOptions.map(option => (
    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.15rem', minWidth: 300, whiteSpace: 'normal' }}>{option.label}</MenuItem>
  ))}
</TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField select label="Condiciones físicas" name="condiciones_fisicas" value={form.condiciones_fisicas} onChange={handleChange} fullWidth required size="large"
  sx={{ fontSize: '1.2rem', mb: 2, minWidth: 300 }}
  InputProps={{ style: { fontSize: '1.2rem', minWidth: 300 } }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        style: { minWidth: 300 }
      }
    }
  }}
>
  {condicionesFisicasOptions.map(option => (
    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.15rem', minWidth: 300, whiteSpace: 'normal' }}>{option.label}</MenuItem>
  ))}
</TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField select label="Fitness goal" name="fitness_goal" value={form.fitness_goal} onChange={handleChange} fullWidth required size="large"
  sx={{ fontSize: '1.2rem', mb: 2, minWidth: 300 }}
  InputProps={{ style: { fontSize: '1.2rem', minWidth: 300 } }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        style: { minWidth: 300 }
      }
    }
  }}
>
  {fitnessGoalOptions.map(option => (
    <MenuItem key={option.value} value={option.value} sx={{ fontSize: '1.15rem', minWidth: 300, whiteSpace: 'normal' }}>{option.label}</MenuItem>
  ))}
</TextField>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Cliente'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddMemberForm;
