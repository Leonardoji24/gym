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
        background: 'linear-gradient(120deg, #f5f7fa 0%, #e3eafc 100%)',
        borderRadius: 3,
        boxShadow: 6,
        borderLeft: '6px solid #1976d2',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.18)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" fontWeight="bold" color="primary" sx={{ letterSpacing: 0.5 }}>
            {nombre}
          </Typography>
          <Chip 
            label={`${cupoMaximo} cupos`} 
            size="small" 
            icon={<People fontSize="small" />}
            color="primary"
            sx={{ fontWeight: 'bold', bgcolor: '#e3eafc', border: '1px solid #1976d2' }}
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 48 }}>
          {descripcion || 'Sin descripción disponible'}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1} color="text.secondary">
          <AccessTime fontSize="small" sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {horario || 'Horario no especificado'}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" color="text.secondary" mb={2}>
          <Person fontSize="small" sx={{ mr: 1, color: '#1976d2' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {entrenador || 'Entrenador no asignado'}
          </Typography>
        </Box>
      </CardContent>
      
      <Box px={3} pb={2} display="flex" justifyContent="flex-end" alignItems="center">
        <Box display="flex" gap={1}>
          <Button 
            size="small" 
            startIcon={<Edit />}
            onClick={() => onEdit(clase)}
            variant="contained"
            sx={{ 
              bgcolor: '#1976d2', 
              color: '#fff', 
              '&:hover': { bgcolor: '#115293' },
              textTransform: 'none',
              fontWeight: 'medium',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Editar
          </Button>
          <Button 
            size="small" 
            startIcon={<Delete />}
            onClick={() => onDelete(clase.id)}
            color="error"
            variant="contained"
            sx={{ 
              color: '#fff', 
              bgcolor: '#d32f2f', 
              '&:hover': { bgcolor: '#9a2424' },
              textTransform: 'none',
              fontWeight: 'medium',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Eliminar
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default ClassCard;
