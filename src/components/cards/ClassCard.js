import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { AccessTime, People, Person, Edit, Delete } from '@mui/icons-material';

const ClassCard = ({ clase, onEdit, onDelete }) => {
  const { nombre, descripcion, horario, cupoMaximo, entrenador } = clase;

  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        },
        borderLeft: '4px solid #3f51b5'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" fontWeight="bold" color="primary">
            {nombre}
          </Typography>
          <Chip 
            label={`${cupoMaximo} cupos`} 
            size="small" 
            icon={<People fontSize="small" />}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {descripcion || 'Sin descripción disponible'}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1} color="text.secondary">
          <AccessTime fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {horario || 'Horario no especificado'}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" color="text.secondary">
          <Person fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {entrenador || 'Entrenador no asignado'}
          </Typography>
        </Box>
      </CardContent>
      
      <Box p={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button 
          size="small" 
          startIcon={<Edit />}
          onClick={() => onEdit(clase)}
          variant="outlined"
        >
          Editar
        </Button>
        <Button 
          size="small" 
          startIcon={<Delete />}
          onClick={() => onDelete(clase.id)}
          color="error"
          variant="outlined"
        >
          Eliminar
        </Button>
      </Box>
    </Card>
  );
};

export default ClassCard;
