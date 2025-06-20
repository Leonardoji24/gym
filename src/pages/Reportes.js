import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, Box, TextField, CircularProgress } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import dayjs from 'dayjs';
import { getReporteAsistencias } from '../services/reportesService';

const Reportes = () => {
  const [loading, setLoading] = useState(true);
  const [asistenciasPorDia, setAsistenciasPorDia] = useState([]);
  const [tiposAsistencia, setTiposAsistencia] = useState({});
  const [fechaInicio, setFechaInicio] = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    setLoading(true);
    getReporteAsistencias({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })
      .then(data => {
        setAsistenciasPorDia(data.asistenciasPorDia || []);
        setTiposAsistencia(data.tiposAsistencia || {});
      })
      .finally(() => setLoading(false));
  }, [fechaInicio, fechaFin]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        <i className="bi bi-graph-up" style={{marginRight:8}}></i> Reportes
      </Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid item>
          <TextField
            label="Desde"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
        <Grid item>
          <TextField
            label="Hasta"
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
      </Grid>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Asistencias por día</Typography>
              <Bar
                data={{
                  labels: asistenciasPorDia.map(d => d.fecha),
                  datasets: [{
                    label: 'Cantidad',
                    data: asistenciasPorDia.map(d => d.cantidad),
                    backgroundColor: '#1976d2',
                  }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Distribución por tipo</Typography>
              <Pie
                data={{
                  labels: Object.keys(tiposAsistencia),
                  datasets: [{
                    label: 'Tipo',
                    data: Object.values(tiposAsistencia),
                    backgroundColor: ['#1976d2', '#43a047', '#ffa000', '#d32f2f'],
                  }],
                }}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reportes;
