import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, TextField, Box,
  Typography, IconButton, CircularProgress, Alert, Snackbar, Button
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Receipt as ReceiptIcon, Search as SearchIcon, Refresh as RefreshIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { getFacturas, eliminarFactura } from '../../services/facturasService';

// Cargar jsPDF y autoTable desde CDN
const loadPdfLibrary = () => {
  return new Promise((resolve) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }

    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
      script2.onload = () => {
        resolve(window.jspdf.jsPDF);
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
  });
};

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFacturas();
      setFacturas(data);
    } catch (err) {
      setError('No se pudieron cargar las facturas.');
      setSnackbar({ open: true, message: 'Error al cargar facturas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta factura?')) return;
    try {
      await eliminarFactura(id);
      setSnackbar({ open: true, message: 'Factura eliminada', severity: 'success' });
      setRefresh(r => !r);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar factura', severity: 'error' });
    }
  };

  const handleRefresh = () => setRefresh(r => !r);
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const exportToPdf = async (factura) => {
    try {
      // Validar datos de la factura
      if (!factura || typeof factura !== 'object') {
        throw new Error('Datos de factura no válidos');
      }

      // Cargar la biblioteca jsPDF
      await loadPdfLibrary();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Configuración inicial
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      
      // Título
      doc.setFontSize(20);
      doc.text('FACTURA', pageWidth / 2, 20, { align: 'center' });
      
      // Información del gimnasio
      doc.setFontSize(10);
      doc.text('Gimnasio FitLife', margin, 40);
      doc.text('Dirección: Av. Principal #123', margin, 45);
      doc.text('Teléfono: (123) 456-7890', margin, 50);
      doc.text('Email: info@gymfitlife.com', margin, 55);
      
      // Información de la factura
      doc.text(`Factura #: ${factura.id}`, 150, 40);
      doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString()}`, 150, 45);
      doc.text(`Estado: ${String(factura.estado || '').toUpperCase()}`, 150, 50);
      
      // Información del cliente
      doc.setFontSize(12);
      doc.text('Cliente:', margin, 75);
      doc.setFontSize(10);
      doc.text(`Nombre: ${factura.miembro_nombre || 'N/A'}`, margin + 5, 80);
      doc.text(`Email: ${factura.miembro_email || 'N/A'}`, margin + 5, 85);
      
      // Tabla de productos/servicios
      const headers = [['Descripción', 'Cantidad', 'Precio', 'Total']];
      const data = [
        [
          factura.concepto || 'Membresía',
          '1',
          `$${Number(factura.total || 0).toFixed(2)}`,
          `$${Number(factura.total || 0).toFixed(2)}`
        ]
      ];
      
      // Usar autoTable para la tabla
      doc.autoTable({
        startY: 100,
        head: headers,
        body: data,
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' }
        }
      });
      
      // Guardar el PDF
      doc.save(`factura-${factura.id}.pdf`);
      
      setSnackbar({ 
        open: true, 
        message: 'Factura descargada exitosamente', 
        severity: 'success' 
      });
      
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      setSnackbar({ 
        open: true, 
        message: `Error al generar el PDF: ${error.message || 'Error desconocido'}`, 
        severity: 'error' 
      });
    }
  };

  const filteredFacturas = facturas.filter(f =>
    f.miembro_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedFacturas = filteredFacturas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const emptyRows = rowsPerPage - paginatedFacturas.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom><ReceiptIcon sx={{ mr: 1 }} /> Facturas</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} disabled>
            Nueva factura
          </Button>
          <IconButton onClick={handleRefresh} title="Refrescar">
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            label="Buscar factura"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            disabled={loading}
          />
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : filteredFacturas.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>No se encontraron facturas.</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 900 }} aria-label="tabla de facturas">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Concepto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Método de pago</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '150px' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFacturas.map(factura => (
                <TableRow key={factura.id} hover>
                  <TableCell>{factura.id}</TableCell>
                  <TableCell>{factura.miembro_nombre}</TableCell>
                  <TableCell>{factura.miembro_email}</TableCell>
                  <TableCell>{new Date(factura.fecha).toLocaleDateString()}</TableCell>
                  <TableCell>{factura.concepto}</TableCell>
                  <TableCell>{
  typeof factura.total === 'number' && !isNaN(factura.total)
    ? `$${factura.total.toFixed(2)}`
    : (Number(factura.total) ? `$${Number(factura.total).toFixed(2)}` : '-')
}</TableCell>
                  <TableCell>{factura.estado}</TableCell>
                  <TableCell>{factura.metodo_pago || '-'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small" disabled title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(factura.id)} title="Eliminar">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      size="small" 
                      onClick={() => exportToPdf(factura)}
                      title="Descargar PDF"
                    >
                      <PdfIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={10} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredFacturas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Facturas;
