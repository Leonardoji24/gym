import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Alert
} from '@mui/material';
import AddRutinaForm from '../../../components/acciones/AddRutinaForm';

const NuevaRutina = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleRutinaCreated = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate('/entrenador/rutinas');
    }, 2000);
  };

  const handleClose = () => {
    navigate('/entrenador/rutinas');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Rutina creada exitosamente. Redirigiendo...
          </Alert>
        )}
        
        <AddRutinaForm
          onRutinaCreated={handleRutinaCreated}
          onClose={handleClose}
        />
      </Paper>
    </Container>
  );
};

export default NuevaRutina;





