import React, { useState } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Grid, Alert
} from '@mui/material';

const roles = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Entrenador' },
  { value: 4, label: 'Cliente' },
];

const initialState = {
  nombre: '',
  email: '',
  telefono: '',
  fecha_inscripcion: '',
  password: '',
  rol_id: 4,
  // Admin
  permisos_especiales: '',
  // Cliente
  fecha_nacimiento: '',
  genero: '',
  direccion: '',
  tipo_membresia: '',
  fecha_vencimiento_membresia: '',
  // Entrenador
  especialidad: '',
  horario_trabajo: '',
  certificaciones: '',
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2, background: '#fafafa' }}>
      <Typography variant="h6" gutterBottom>Agregar Nuevo Miembro</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required type="email" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Fecha de inscripción" name="fecha_inscripcion" value={form.fecha_inscripcion} onChange={handleChange} fullWidth required type="date" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField label="Contraseña" name="password" value={form.password} onChange={handleChange} fullWidth required type="password" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField select label="Rol" name="rol_id" value={form.rol_id} onChange={handleRoleChange} fullWidth required>
            {roles.map((rol) => (
              <MenuItem key={rol.value} value={rol.value}>{rol.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        {/* Campos por rol */}
        {form.rol_id === 1 && (
          <Grid item xs={12} md={6}>
            <TextField label="Permisos Especiales" name="permisos_especiales" value={form.permisos_especiales} onChange={handleChange} fullWidth />
          </Grid>
        )}
        {form.rol_id === 2 && (
          <>
            <Grid item xs={12} md={4}>
              <TextField label="Especialidad" name="especialidad" value={form.especialidad} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Horario de trabajo" name="horario_trabajo" value={form.horario_trabajo} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Certificaciones" name="certificaciones" value={form.certificaciones} onChange={handleChange} fullWidth />
            </Grid>
          </>
        )}
        {form.rol_id === 4 && (
          <>
            <Grid item xs={12} md={4}>
              <TextField label="Fecha de nacimiento" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} fullWidth type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Género" name="genero" value={form.genero} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Tipo de membresía" name="tipo_membresia" value={form.tipo_membresia} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Fecha de vencimiento de membresía" name="fecha_vencimiento_membresia" value={form.fecha_vencimiento_membresia} onChange={handleChange} fullWidth type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Miembro'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddMemberForm;
