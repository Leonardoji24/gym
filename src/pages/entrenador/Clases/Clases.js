import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../../../contexts/AuthContext';

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRefresh = () => {
    const fetchClases = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clases');
        
        console.log('Usuario logueado:', user);
        console.log('Todas las clases:', response.data);
        
        const clasesFormateadas = Array.isArray(response.data) ? response.data
          .filter(clase => clase && typeof clase === 'object') // Filtrar elementos válidos
          .filter(clase => {
            console.log('Comparando clase.id_entrenador:', clase.id_entrenador, 'con user?.id:', user?.id);
            // Si no hay usuario logueado, mostrar solo las clases del Entrenador Principal (ID: 5)
            if (!user?.id) {
              console.log('No hay usuario logueado, mostrando clases del Entrenador Principal (ID: 5)');
              return clase.id_entrenador == 5; // Entrenador Principal
            }
            // Comparar el ID del entrenador de la clase con el ID del miembro logueado
            return clase.id_entrenador == user?.id; // Usar == para comparar string con número
          }) // Filtrar solo las clases del entrenador logueado
          .map(clase => {
            // Solo procesar el horario
            let hora = 'Sin horario';
            
            if (clase.horario && clase.horario.trim() !== '') {
              hora = clase.horario;
            } else {
              // Generar un horario por defecto basado en el ID
              const horas = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
              const horaIndex = (clase.id || 1) % horas.length;
              hora = horas[horaIndex];
            }
            
            return {
              id: clase.id || Math.random().toString(36).substr(2, 9),
              nombre: clase.nombre || 'Sin nombre',
              hora: hora,
              duracion: clase.duracion || '60 min',
              capacidad: clase.cupo_maximo || 20,
              inscritos: clase.inscritos || 0,
              estado: clase.estado || 'Programada',
              descripcion: clase.descripcion || '',
              entrenador: clase.nombre_entrenador || 'Sin asignar'
            };
          }) : [];
        
        console.log('Clases filtradas:', clasesFormateadas);
        setClases(clasesFormateadas);
      } catch (error) {
        console.error('Error al refrescar clases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  };

  // Cargar clases desde la API
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clases');
        
        console.log('Usuario logueado:', user);
        console.log('Todas las clases:', response.data);
        
        // Transformar los datos para que coincidan con el formato esperado
        const clasesFormateadas = Array.isArray(response.data) ? response.data
          .filter(clase => clase && typeof clase === 'object') // Filtrar elementos válidos
          .filter(clase => {
            console.log('Comparando clase.id_entrenador:', clase.id_entrenador, 'con user?.id:', user?.id);
            // Si no hay usuario logueado, mostrar solo las clases del Entrenador Principal (ID: 5)
            if (!user?.id) {
              console.log('No hay usuario logueado, mostrando clases del Entrenador Principal (ID: 5)');
              return clase.id_entrenador == 5; // Entrenador Principal
            }
            // Comparar el ID del entrenador de la clase con el ID del miembro logueado
            return clase.id_entrenador == user?.id; // Usar == para comparar string con número
          }) // Filtrar solo las clases del entrenador logueado
          .map(clase => {
            // Solo procesar el horario
            let hora = 'Sin horario';
            
            if (clase.horario && clase.horario.trim() !== '') {
              hora = clase.horario;
            } else {
              // Generar un horario por defecto basado en el ID
              const horas = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
              const horaIndex = (clase.id || 1) % horas.length;
              hora = horas[horaIndex];
            }
            
            return {
              id: clase.id || Math.random().toString(36).substr(2, 9),
              nombre: clase.nombre || 'Sin nombre',
              hora: hora,
              duracion: clase.duracion || '60 min',
              capacidad: clase.cupo_maximo || 20,
              inscritos: clase.inscritos || 0,
              estado: clase.estado || 'Programada',
              descripcion: clase.descripcion || '',
              entrenador: clase.nombre_entrenador || 'Sin asignar'
            };
          }) : [];
        
        console.log('Clases filtradas:', clasesFormateadas);
        setClases(clasesFormateadas);
      } catch (error) {
        console.error('Error al cargar clases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  }, [user?.id]); // Agregar user?.id como dependencia

  const columns = [
    { field: 'nombre', headerName: 'Clase', flex: 1 },
    { 
      field: 'hora', 
      headerName: 'Horario', 
      flex: 1,
      valueGetter: (params) => {
        // Si params es directamente el valor (string), usarlo
        if (typeof params === 'string') {
          return params;
        }
        
        // Si params es un objeto con el valor
        if (params && typeof params === 'object') {
          if (params.value) return params.value;
          if (params.row && params.row.hora) return params.row.hora;
        }
        
        return 'Sin horario';
      }
    },
    { field: 'duracion', headerName: 'Duración', width: 120 },
    { field: 'entrenador', headerName: 'Entrenador', width: 150 },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 130,
      renderCell: (params) => {
        if (!params.row) return <Chip label="Sin estado" color="default" size="small" />;
        const estado = params.value || 'Sin estado';
        return (
          <Chip 
            label={estado} 
            color={
              estado === 'Programada' ? 'primary' : 
              estado === 'En curso' ? 'success' : 'default'
            }
            size="small"
          />
        );
      }
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: () => (
        <Button
          variant="contained"
          size="small"
          disabled={true}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            backgroundColor: '#e0e0e0',
            color: '#9e9e9e',
            '&:hover': {
              backgroundColor: '#bdbdbd',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              color: '#9e9e9e',
              backgroundColor: '#f5f5f5',
            }
          }}
        >
          Tomar Asistencia
        </Button>
      ),
    },
  ];

  const filteredClases = clases.filter(clase =>
    Object.values(clase).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box sx={{ 
      p: 4, 
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        background: 'white', 
        borderRadius: 2, 
        p: 4, 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: '600', 
              color: '#1e293b'
            }}
          >
            Mis Clases
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                borderRadius: 1,
                borderColor: '#64748b',
                color: '#64748b',
                '&:hover': {
                  borderColor: '#475569',
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Buscar clases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 4,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: '#f8fafc',
              '&:hover': {
                backgroundColor: '#f1f5f9'
              },
              '&.Mui-focused': {
                backgroundColor: 'white'
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64748b' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ 
          background: 'white', 
          borderRadius: 1, 
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <DataGrid
            rows={filteredClases}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            loading={loading}
            disableSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
                backgroundColor: 'transparent',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f1f5f9',
                padding: '12px 16px',
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                }
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f8fafc',
                color: '#475569',
                borderBottom: '2px solid #e2e8f0',
                '& .MuiDataGrid-columnHeader': {
                  borderRight: '1px solid #e2e8f0',
                  '&:last-child': {
                    borderRight: 'none'
                  }
                }
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: 'transparent',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
              },
              '& .MuiDataGrid-row': {
                '&:nth-of-type(even)': {
                  backgroundColor: '#f8fafc',
                },
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                }
              },
              '& .MuiChip-root': {
                borderRadius: '6px',
                fontWeight: '500',
                '&.MuiChip-colorPrimary': {
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Clases;
