import React from 'react';
import { Typography, Box } from '@mui/material';

const Reportes = () => {


  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        <i className="bi bi-graph-up" style={{marginRight:8}}></i> Reportes
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Aquí se mostrarán los reportes de ingresos, membresías y otros datos relevantes próximamente.
      </Typography>
    </Box>
  );
};

export default Reportes;
