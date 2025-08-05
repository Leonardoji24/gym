import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Alert, 
  TablePagination,
  tableCellClasses,
  styled 
} from '@mui/material';
import { getMiembrosActivos } from '../../services/reportesService';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
  },
}));

const Reportes = () => {
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMiembrosActivos();
        setMiembros(data);
      } catch (err) {
        setError('No se pudieron cargar las membresías activas');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: 'primary.main',
          fontWeight: 'bold',
          mb: 4,
          borderBottom: '3px solid',
          borderColor: 'primary.main',
          display: 'inline-block',
          pb: 1
        }}
      >
        Membresías Activas
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Nombre</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Teléfono</StyledTableCell>
                  <StyledTableCell>Tipo de Membresía</StyledTableCell>
                  <StyledTableCell>Fecha de Vencimiento</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {miembros.map((miembro) => (
                  <StyledTableRow key={miembro.id} hover>
                    <StyledTableCell sx={{ fontWeight: 'medium' }}>{miembro.nombre}</StyledTableCell>
                    <StyledTableCell>{miembro.email}</StyledTableCell>
                    <StyledTableCell>{miembro.telefono}</StyledTableCell>
                    <StyledTableCell>
                      <Box 
                        sx={{
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          fontWeight: 'medium'
                        }}
                      >
                        {miembro.tipo_membresia}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell 
                      sx={{
                        color: (theme) => {
                          if (!miembro.fecha_vencimiento_membresia) return 'inherit';
                          const fechaVencimiento = new Date(miembro.fecha_vencimiento_membresia);
                          const hoy = new Date();
                          const diferenciaDias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
                          
                          if (diferenciaDias < 0) return theme.palette.error.main;
                          if (diferenciaDias <= 7) return theme.palette.warning.dark;
                          return theme.palette.success.main;
                        },
                        fontWeight: 'bold'
                      }}
                    >
                      {miembro.fecha_vencimiento_membresia}
                      {miembro.fecha_vencimiento_membresia && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {(() => {
                            const fechaVencimiento = new Date(miembro.fecha_vencimiento_membresia);
                            const hoy = new Date();
                            const diferenciaDias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
                            
                            if (diferenciaDias < 0) return 'Vencida';
                            if (diferenciaDias === 0) return 'Vence hoy';
                            if (diferenciaDias === 1) return 'Vence mañana';
                            return `Vence en ${diferenciaDias} días`;
                          })()}
                        </Typography>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                {miembros.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        No hay membresías activas en este momento.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default Reportes;
