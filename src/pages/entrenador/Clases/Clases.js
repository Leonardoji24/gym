import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField, InputAdornment, Chip } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Datos de ejemplo (reemplazar con llamada a la API)
  useEffect(() => {
    const fetchClases = async () => {
      try {
        // Simular carga de datos
        const data = [
          { 
            id: 1, 
            nombre: 'Spinning', 
            fecha: '2023-11-15',
            hora: '09:00',
            duracion: '60 min',
            capacidad: 15,
            inscritos: 12,
            estado: 'Programada'
          },
          { 
            id: 2, 
            nombre: 'Yoga', 
            fecha: '2023-11-15',
            hora: '11:00',
            duracion: '45 min',
            capacidad: 10,
            inscritos: 8,
            estado: 'En curso'
          },
          { 
            id: 3, 
            nombre: 'Crossfit', 
            fecha: '2023-11-16',
            hora: '18:00',
            duracion: '60 min',
            capacidad: 12,
            inscritos: 10,
            estado: 'Programada'
          },
        ];
        setClases(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar clases:', error);
        setLoading(false);
      }
    };

    fetchClases();
  }, []);

  const columns = [
    { field: 'nombre', headerName: 'Clase', flex: 1 },
    { 
      field: 'fecha', 
      headerName: 'Fecha y Hora', 
      flex: 1,
      valueGetter: (params) => `${params.row.fecha} ${params.row.hora}`
    },
    { field: 'duracion', headerName: 'Duración', width: 120 },
    { 
      field: 'inscritos', 
      headerName: 'Asistencia', 
      width: 150,
      renderCell: (params) => (
        <div>
          {params.value}/{params.row.capacidad}
        </div>
      )
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Programada' ? 'primary' : 
            params.value === 'En curso' ? 'success' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <div>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => navigate(`/entrenador/clases/${params.row.id}`)}
            sx={{ mr: 1 }}
          >
            Ver
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            onClick={() => navigate(`/entrenador/clases/${params.row.id}/asistencia`)}
          >
            Asistencia
          </Button>
        </div>
      ),
    },
  ];

  const filteredClases = clases.filter(clase =>
    Object.values(clase).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="entrenador-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Mis Clases
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/entrenador/clases/nueva')}
        >
          Nueva Clase
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          variant="outlined"
          placeholder="Buscar clases..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <div style={{ height: 500, width: '100%', backgroundColor: 'white' }}>
        <DataGrid
          rows={filteredClases}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          loading={loading}
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default Clases;
