import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import API_CONFIG from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = `${API_CONFIG.BASE_URL}/api`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const Reportes = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMembresias, setLoadingMembresias] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Ingresos por Membresías',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  });
  
  // Estado para el reporte de membresías
  const [reporteMembresias, setReporteMembresias] = useState({
    resumen: [],
    distribucionGenero: [],
    proximasVencer: [],
    estadisticas: {}
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && !reporteMembresias.estadisticas.total_miembros) {
      fetchReporteMembresias();
    }
  };

  const fetchReporteMembresias = async () => {
    try {
      setLoadingMembresias(true);
      const response = await axios.get(`${API_URL}/reportes/membresias`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setReporteMembresias({
        resumen: response.data.resumen_por_tipo || [],
        distribucionGenero: response.data.distribucion_genero || [],
        proximasVencer: response.data.proximas_vencer || [],
        estadisticas: response.data.estadisticas || {}
      });
      
    } catch (err) {
      console.error('Error al cargar el reporte de membresías:', err);
      setError('No se pudieron cargar los datos de membresías');
    } finally {
      setLoadingMembresias(false);
    }
  };

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ingresos-membresias`, {
        params: { rango: timeRange },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = response.data;
      
      // Formatear fechas según el rango seleccionado
      const formatDate = (date) => {
        const d = new Date(date);
        if (timeRange === 'year') {
          return format(d, 'MMM yyyy', { locale: es });
        } else if (timeRange === 'month') {
          return format(d, 'dd MMM', { locale: es });
        } else {
          return format(d, 'HH:00', { locale: es });
        }
      };

      setChartData({
        labels: data.map(item => formatDate(item.fecha)),
        datasets: [
          {
            ...chartData.datasets[0],
            data: data.map(item => item.total)
          }
        ]
      });
    } catch (err) {
      console.error('Error al cargar los datos de ingresos:', err);
      setError('No se pudieron cargar los datos de ingresos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, [timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ingresos por Membresías',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: timeRange === 'year' ? 'Mes' : timeRange === 'month' ? 'Día' : 'Hora'
        }
      }
    }
  };

  // Datos para el gráfico de distribución por género
  const generoChartData = {
    labels: reporteMembresias.distribucionGenero.map(item => item.genero),
    datasets: [
      {
        data: reporteMembresias.distribucionGenero.map(item => item.porcentaje),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Datos para el gráfico de distribución por tipo de membresía
  const tipoMembresiaData = {
    labels: reporteMembresias.resumen.map(item => item.tipo_membresia || 'Sin tipo'),
    datasets: [
      {
        label: 'Miembros por tipo de membresía',
        data: reporteMembresias.resumen.map(item => item.cantidad_por_tipo),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        <i className="bi bi-graph-up" style={{marginRight:8}}></i> Reportes
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="reportes tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Ingresos" {...a11yProps(0)} />
          <Tab label="Membresías" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Período"
            >
              <MenuItem value="day">Últimas 24 horas</MenuItem>
              <MenuItem value="month">Últimos 30 días</MenuItem>
              <MenuItem value="year">Últimos 12 meses</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Ingresos por Membresías
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Box sx={{ height: 400 }}>
              <Line options={options} data={chartData} />
            </Box>
          )}
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {loadingMembresias ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box>
            {/* Estadísticas generales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GroupIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Miembros Totales
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {reporteMembresias.estadisticas.total_miembros || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Edad Promedio
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {reporteMembresias.estadisticas.edad_promedio 
                        ? Math.round(reporteMembresias.estadisticas.edad_promedio) 
                        : 0} años
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventAvailableIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        Tipos de Membresía
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {reporteMembresias.estadisticas.tipos_membresia_diferentes || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Gráficos */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Distribución por Género
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie 
                      data={generoChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Distribución por Tipo de Membresía
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar 
                      data={tipoMembresiaData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Próximas a vencer */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Membresías por Vencer (Próximos 30 días)</Typography>
              </Box>
              
              {reporteMembresias.proximasVencer.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Miembro</TableCell>
                        <TableCell>Tipo de Membresía</TableCell>
                        <TableCell>Fecha de Vencimiento</TableCell>
                        <TableCell>Días Restantes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reporteMembresias.proximasVencer.map((membresia, index) => (
                        <TableRow key={index}>
                          <TableCell>{membresia.nombre_completo}</TableCell>
                          <TableCell>{membresia.tipo_membresia || 'No especificado'}</TableCell>
                          <TableCell>
                            {format(parseISO(membresia.fecha_vencimiento_membresia), 'dd/MM/yyyy', { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${membresia.dias_restantes} días`} 
                              color={membresia.dias_restantes <= 7 ? 'error' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay membresías por vencer en los próximos 30 días.
                </Typography>
              )}
            </Paper>
            
            {/* Resumen por tipo de membresía */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumen por Tipo de Membresía
              </Typography>
              
              {reporteMembresias.resumen.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo de Membresía</TableCell>
                        <TableCell align="right">Total Miembros</TableCell>
                        <TableCell align="right">Miembros Activos</TableCell>
                        <TableCell align="right">Miembros Inactivos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reporteMembresias.resumen.map((tipo, index) => (
                        <TableRow key={index}>
                          <TableCell>{tipo.tipo_membresia || 'No especificado'}</TableCell>
                          <TableCell align="right">{tipo.total_miembros}</TableCell>
                          <TableCell align="right">{tipo.miembros_activos}</TableCell>
                          <TableCell align="right">{tipo.miembros_inactivos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay datos disponibles para mostrar.
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default Reportes;
