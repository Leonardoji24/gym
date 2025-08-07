import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { 
  getReporteAsistencia, 
  getReporteRutinas, 
  getReporteClientes, 
  getReporteProgreso 
} from '../../../services/reportesService';
import 'bootstrap-icons/font/bootstrap-icons.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('asistencia');
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [rangoTiempo, setRangoTiempo] = useState('semana');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datosReporte, setDatosReporte] = useState(null);

  // Cargar datos del reporte
  const cargarReporte = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let datos;
      switch (tipoReporte) {
        case 'asistencia':
          datos = await getReporteAsistencia(rangoTiempo, fechaInicio?.toISOString().split('T')[0], fechaFin?.toISOString().split('T')[0]);
          break;
        case 'rutinas':
          datos = await getReporteRutinas();
          break;
        case 'clientes':
          datos = await getReporteClientes();
          break;
        case 'progreso':
          datos = await getReporteProgreso();
          break;
        default:
          datos = await getReporteAsistencia();
      }
      
      setDatosReporte(datos);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError('Error al cargar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar reporte inicial
  useEffect(() => {
    cargarReporte();
  }, []);

  // Renderizar gráfico de asistencia
  const renderGraficoAsistencia = () => {
    if (!datosReporte?.datos_grafico) return null;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={datosReporte.datos_grafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="asistencias" fill="#8884d8" name="Asistencias" />
          <Bar dataKey="clientes_unicos" fill="#82ca9d" name="Clientes Únicos" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Renderizar gráfico de rutinas por nivel
  const renderGraficoRutinasNivel = () => {
    if (!datosReporte?.rutinas_por_nivel) return null;
    
    const datos = datosReporte.rutinas_por_nivel.map(item => ({
      name: item.nivel.charAt(0).toUpperCase() + item.nivel.slice(1),
      value: item.total_rutinas,
      asignadas: item.rutinas_asignadas
    }));
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '80%', maxWidth: '500px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datos}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {datos.map((entry, index) => (
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
  };

  // Renderizar gráfico de clientes por estado
  const renderGraficoClientes = () => {
    if (!datosReporte?.clientes_por_estado) return null;
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '80%', maxWidth: '500px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datosReporte.clientes_por_estado}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="total"
                nameKey="estado"
                label={({ estado, total }) => `${estado}: ${total}`}
              >
                {datosReporte.clientes_por_estado.map((entry, index) => (
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
  };

  // Renderizar tabla de top rutinas
  const renderTablaTopRutinas = () => {
    if (!datosReporte?.top_rutinas) return null;
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rutina</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Objetivo</TableCell>
              <TableCell align="right">Asignaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datosReporte.top_rutinas.map((rutina, index) => (
              <TableRow key={index}>
                <TableCell>{rutina.nombre}</TableCell>
                <TableCell>
                  <Chip 
                    label={rutina.nivel.charAt(0).toUpperCase() + rutina.nivel.slice(1)} 
                    size="small" 
                    color="primary" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={rutina.objetivo.replace('_', ' ').charAt(0).toUpperCase() + rutina.objetivo.replace('_', ' ').slice(1)} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell align="right">{rutina.total_asignaciones}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Renderizar tabla de progreso
  const renderTablaProgreso = () => {
    if (!datosReporte?.progreso_clientes) return null;
    
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Sesiones Completadas</TableCell>
              <TableCell align="right">Dificultad Promedio</TableCell>
              <TableCell>Última Sesión</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datosReporte.progreso_clientes.map((cliente, index) => (
              <TableRow key={index}>
                <TableCell>{cliente.cliente}</TableCell>
                <TableCell align="right">{cliente.sesiones_completadas}</TableCell>
                <TableCell align="right">
                  {cliente.dificultad_promedio ? cliente.dificultad_promedio.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell>
                  {cliente.ultima_sesion ? new Date(cliente.ultima_sesion).toLocaleDateString() : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Renderizar estadísticas
  const renderEstadisticas = () => {
    if (!datosReporte) return null;
    
    let stats = [];
    
    switch (tipoReporte) {
      case 'asistencia':
        if (datosReporte.estadisticas) {
          stats = [
            { label: 'Total Asistencias', value: datosReporte.estadisticas.total_asistencias || 0 },
            { label: 'Clientes Únicos', value: datosReporte.estadisticas.clientes_unicos || 0 },
            { label: 'Tiempo Promedio (min)', value: datosReporte.estadisticas.tiempo_promedio ? Math.round(datosReporte.estadisticas.tiempo_promedio) : 0 }
          ];
        }
        break;
      case 'rutinas':
        if (datosReporte.estadisticas) {
          stats = [
            { label: 'Total Rutinas', value: datosReporte.estadisticas.total_rutinas || 0 },
            { label: 'Total Asignaciones', value: datosReporte.estadisticas.total_asignaciones || 0 },
            { label: 'Clientes Activos', value: datosReporte.estadisticas.clientes_activos || 0 }
          ];
        }
        break;
      case 'clientes':
        if (datosReporte.estadisticas) {
          stats = [
            { label: 'Total Clientes', value: datosReporte.estadisticas.total_clientes || 0 },
            { label: 'Clientes Activos', value: datosReporte.estadisticas.clientes_activos || 0 },
            { label: 'Clientes Inactivos', value: datosReporte.estadisticas.clientes_inactivos || 0 }
          ];
        }
        break;
      case 'progreso':
        if (datosReporte.estadisticas_progreso) {
          stats = [
            { label: 'Clientes con Progreso', value: datosReporte.estadisticas_progreso.clientes_con_progreso || 0 },
            { label: 'Total Sesiones', value: datosReporte.estadisticas_progreso.total_sesiones || 0 },
            { label: 'Dificultad Promedio', value: datosReporte.estadisticas_progreso.dificultad_promedio ? datosReporte.estadisticas_progreso.dificultad_promedio.toFixed(1) : 'N/A' }
          ];
        }
        break;
    }
    
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Renderizar gráfico según tipo de reporte
  const renderGrafico = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    switch (tipoReporte) {
      case 'asistencia':
        return renderGraficoAsistencia();
      case 'rutinas':
        return renderGraficoRutinasNivel();
      case 'clientes':
        return renderGraficoClientes();
      case 'progreso':
        return renderTablaProgreso();
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
                  <MenuItem value="rutinas">Rutinas</MenuItem>
                  <MenuItem value="clientes">Clientes</MenuItem>
                  <MenuItem value="progreso">Progreso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {tipoReporte === 'asistencia' && (
              <>
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
              </>
            )}

            <Grid item xs={12} md={2}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{ height: '56px' }}
                onClick={cargarReporte}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generar'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {renderEstadisticas()}

      {/* Gráfico */}
      <Card>
        <CardContent>
          <Box sx={{ height: '500px' }}>
            {renderGrafico()}
          </Box>
        </CardContent>
      </Card>

      {/* Tabla adicional para rutinas */}
      {tipoReporte === 'rutinas' && renderTablaTopRutinas()}

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
