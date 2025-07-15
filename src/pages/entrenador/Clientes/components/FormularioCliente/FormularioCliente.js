import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import CloseIcon from '@mui/icons-material/Close';

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
];

const TIPOS_MEMBRESIA = [
  { value: 'basica', label: 'Básica' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
];

const FormularioCliente = ({ 
  open, 
  onClose, 
  cliente = null, 
  onSubmit,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    fechaNacimiento: null,
    genero: '',
    tipoMembresia: '',
    fechaInicioMembresia: null,
    fechaFinMembresia: null,
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    notas: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellidoPaterno: cliente.apellidoPaterno || '',
        apellidoMaterno: cliente.apellidoMaterno || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        fechaNacimiento: cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento) : null,
        genero: cliente.genero || '',
        tipoMembresia: cliente.tipoMembresia || '',
        fechaInicioMembresia: cliente.fechaInicioMembresia ? new Date(cliente.fechaInicioMembresia) : null,
        fechaFinMembresia: cliente.fechaFinMembresia ? new Date(cliente.fechaFinMembresia) : null,
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        codigoPostal: cliente.codigoPostal || '',
        notas: cliente.notas || ''
      });
    } else {
      // Reset form when opening for new client
      setFormData({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        telefono: '',
        fechaNacimiento: null,
        genero: '',
        tipoMembresia: '',
        fechaInicioMembresia: null,
        fechaFinMembresia: null,
        direccion: '',
        ciudad: '',
        codigoPostal: '',
        notas: ''
      });
    }
    setErrors({});
  }, [cliente, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    if (formData.telefono && !/^[0-9+\-\s()]*$/.test(formData.telefono)) {
      newErrors.telefono = 'Número de teléfono no válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                error={!!errors.apellidoPaterno}
                helperText={errors.apellidoPaterno}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Apellido Materno"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                error={!!errors.telefono}
                helperText={errors.telefono}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de Nacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleDateChange('fechaNacimiento')}
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
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="genero-label">Género</InputLabel>
                <Select
                  labelId="genero-label"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  label="Género"
                >
                  {GENEROS.map((genero) => (
                    <MenuItem key={genero.value} value={genero.value}>
                      {genero.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="tipo-membresia-label">Tipo de Membresía</InputLabel>
                <Select
                  labelId="tipo-membresia-label"
                  name="tipoMembresia"
                  value={formData.tipoMembresia}
                  onChange={handleChange}
                  label="Tipo de Membresía"
                >
                  {TIPOS_MEMBRESIA.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Inicio de Membresía"
                  value={formData.fechaInicioMembresia}
                  onChange={handleDateChange('fechaInicioMembresia')}
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
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fin de Membresía"
                  value={formData.fechaFinMembresia}
                  onChange={handleDateChange('fechaFinMembresia')}
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código Postal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {cliente ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormularioCliente;
