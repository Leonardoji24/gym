import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import 'bootstrap-icons/font/bootstrap-icons.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('asistencia');
  const [fechaInicio, setFechaInicio] = useState(new Date('2023-10-01'));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [rangoTiempo, setRangoTiempo] = useState('semana');

  // Datos de ejemplo para gráficos
  const datosAsistencia = [
    { name: 'Lun', asistencias: 12 },
    { name: 'Mar', asistencias: 19 },
    { name: 'Mié', asistencias: 15 },
    { name: 'Jue', asistencias: 21 },
    { name: 'Vie', asistencias: 18 },
    { name: 'Sáb', asistencias: 14 },
    { name: 'Dom', asistencias: 8 },
  ];

  const datosClases = [
    { name: 'Spinning', value: 35 },
    { name: 'Yoga', value: 25 },
    { name: 'Crossfit', value: 20 },
    { name: 'Zumba', value: 15 },
    { name: 'Pilates', value: 10 },
  ];

  const datosClientes = [
    { name: 'Nuevos', value: 15 },
    { name: 'Activos', value: 45 },
    { name: 'Inactivos', value: 10 },
  ];

  const renderGrafico = () => {
    switch (tipoReporte) {
      case 'asistencia':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosAsistencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="asistencias" fill="#8884d8" name="Asistencias" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'clases':
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '80%', maxWidth: '500px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={datosClases}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {datosClases.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'clientes':
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '80%', maxWidth: '500px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={datosClientes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {datosClientes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="entrenador-page">
      <Box mb={4}>
        <Typography variant="h5" component="h1" gutterBottom>
          Reportes y Análisis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualiza y analiza el rendimiento de tus actividades como entrenador
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="tipo-reporte-label">Tipo de Reporte</InputLabel>
                <Select
                  labelId="tipo-reporte-label"
                  value={tipoReporte}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  label="Tipo de Reporte"
                >
                  <MenuItem value="asistencia">Asistencia</MenuItem>
                  <MenuItem value="clases">Clases Populares</MenuItem>
                  <MenuItem value="clientes">Estadísticas de Clientes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="rango-tiempo-label">Rango de Tiempo</InputLabel>
                <Select
                  labelId="rango-tiempo-label"
                  value={rangoTiempo}
                  onChange={(e) => setRangoTiempo(e.target.value)}
                  label="Rango de Tiempo"
                >
                  <MenuItem value="dia">Hoy</MenuItem>
                  <MenuItem value="semana">Esta semana</MenuItem>
                  <MenuItem value="mes">Este mes</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {rangoTiempo === 'personalizado' && (
              <>
                <Grid item xs={12} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha inicio"
                      value={fechaInicio}
                      onChange={(newValue) => setFechaInicio(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label="Fecha fin"
                      value={fechaFin}
                      onChange={(newValue) => setFechaFin(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={2}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{ height: '56px' }}
                onClick={() => console.log('Generar reporte')}
              >
                Generar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ height: '500px' }}>
            {renderGrafico()}
          </Box>
        </CardContent>
      </Card>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={<i className="bi bi-download"></i>}
          onClick={() => console.log('Exportar a PDF')}
          sx={{ mr: 2 }}
        >
          Exportar PDF
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<i className="bi bi-file-earmark-excel"></i>}
          onClick={() => console.log('Exportar a Excel')}
        >
          Exportar Excel
        </Button>
      </Box>
    </div>
  );
};

export default Reportes;
