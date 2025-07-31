import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Card, CardContent, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Button,
  TextField, Snackbar, Alert
} from '@mui/material';
import { 
  AttachMoney as AttachMoneyIcon, 
  People as PeopleIcon, 
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getFacturas } from '../../services/facturasService';
import { getInventario } from '../../services/inventarioService';

const VentasFinanzas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [data, setData] = useState({
    facturas: [],
    inventario: [],
    metrics: {
      totalVentas: 0,
      totalProductos: 0,
      crecimiento: 0,
      ticketPromedio: 0
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener facturas e inventario en paralelo
      const [facturas, inventario] = await Promise.all([
        getFacturas(),
        getInventario()
      ]);

      // Calcular métricas
      const totalVentas = facturas.reduce((sum, factura) => sum + (parseFloat(factura.total) || 0), 0);
      const totalProductos = inventario.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0);
      const ticketPromedio = facturas.length > 0 ? totalVentas / facturas.length : 0;
      
      // Calcular crecimiento (ejemplo: comparar con el mes anterior)
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const facturasMesActual = facturas.filter(f => new Date(f.fecha).getMonth() === mesActual);
      const facturasMesAnterior = facturas.filter(f => new Date(f.fecha).getMonth() === (mesActual - 1 + 12) % 12);
      
      const ventasMesActual = facturasMesActual.reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0);
      const ventasMesAnterior = facturasMesAnterior.reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0);
      
      const crecimiento = ventasMesAnterior > 0 
        ? ((ventasMesActual - ventasMesAnterior) / ventasMesAnterior) * 100 
        : ventasMesActual > 0 ? 100 : 0;

      setData({
        facturas: facturas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
        inventario,
        metrics: {
          totalVentas,
          totalProductos,
          crecimiento: parseFloat(crecimiento.toFixed(2)),
          ticketPromedio: parseFloat(ticketPromedio.toFixed(2))
        }
      });
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos financieros.');
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && data.facturas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon sx={{ mr: 1 }} /> Ventas y Finanzas
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Buscar facturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            disabled={loading}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Métricas principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" gutterBottom>Ventas Totales</Typography>
                  <Typography variant="h5">{formatCurrency(data.metrics.totalVentas)}</Typography>
                  <Typography 
                    variant="body2" 
                    color={data.metrics.crecimiento >= 0 ? 'success.main' : 'error.main'}
                    sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                  >
                    <TrendingUpIcon 
                      fontSize="small" 
                      sx={{ 
                        mr: 0.5,
                        transform: data.metrics.crecimiento < 0 ? 'rotate(180deg)' : 'none' 
                      }} 
                    />
                    {Math.abs(data.metrics.crecimiento)}% {data.metrics.crecimiento >= 0 ? 'más' : 'menos'} que el mes anterior
                  </Typography>
                </div>
                <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" gutterBottom>Productos en Inventario</Typography>
                  <Typography variant="h5">{data.metrics.totalProductos}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {data.inventario.length} tipos de productos
                  </Typography>
                </div>
                <PeopleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography color="textSecondary" gutterBottom>Ticket Promedio</Typography>
                  <Typography variant="h5">{formatCurrency(data.metrics.ticketPromedio)}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {data.facturas.length} facturas registradas
                  </Typography>
                </div>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Últimas facturas */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Últimas Facturas</Typography>
            <Typography variant="body2" color="textSecondary">
              Mostrando {Math.min(5, data.facturas.length)} de {data.facturas.length} facturas
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Concepto</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.facturas
                  .filter(factura => 
                    factura.miembro_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    factura.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    factura.id.toString().includes(searchTerm)
                  )
                  .slice(0, 5)
                  .map((factura) => (
                    <TableRow key={factura.id} hover>
                      <TableCell>
                        {new Date(factura.fecha).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{factura.miembro_nombre || 'Cliente no especificado'}</TableCell>
                      <TableCell>{factura.concepto || 'Sin descripción'}</TableCell>
                      <TableCell align="right">{formatCurrency(parseFloat(factura.total) || 0)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: factura.estado === 'pagada' ? 'success.light' : 'error.light',
                            color: factura.estado === 'pagada' ? 'success.contrastText' : 'error.contrastText',
                            fontSize: '0.75rem',
                            fontWeight: 'medium'
                          }}
                        >
                          {factura.estado || 'pendiente'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {data.facturas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">
                        No hay facturas registradas
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VentasFinanzas;
