import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, TextField, InputAdornment, Chip, Card, CardContent, CardActions } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, FitnessCenter } from '@mui/icons-material';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Rutinas = () => {
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid'); // 'grid' o 'list'
  const navigate = useNavigate();

  // Datos de ejemplo (reemplazar con llamada a la API)
  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        // Simular carga de datos
        const data = [
          { 
            id: 1, 
            nombre: 'Rutina Inicial', 
            descripcion: 'Rutina básica para principiantes',
            nivel: 'Principiante',
            ejercicios: 8,
            clientes: 5,
            creada: '2023-10-01',
          },
          { 
            id: 2, 
            nombre: 'Rutina Avanzada', 
            descripcion: 'Rutina intensiva para avanzados',
            nivel: 'Avanzado',
            ejercicios: 12,
            clientes: 3,
            creada: '2023-10-15',
          },
          { 
            id: 3, 
            nombre: 'Rutina Cardio', 
            descripcion: 'Ejercicios cardiovasculares',
            nivel: 'Intermedio',
            ejercicios: 6,
            clientas: 7,
            creada: '2023-10-20',
          },
        ];
        setRutinas(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar rutinas:', error);
        setLoading(false);
      }
    };

    fetchRutinas();
  }, []);

  const columns = [
    { 
      field: 'nombre', 
      headerName: 'Nombre', 
      flex: 1,
      renderCell: (params) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{params.value}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{params.row.descripcion}</div>
        </div>
      )
    },
    { 
      field: 'nivel', 
      headerName: 'Nivel', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Principiante' ? 'primary' : 
            params.value === 'Intermedio' ? 'secondary' : 'default'
          }
          size="small"
        />
      )
    },
    { field: 'ejercicios', headerName: 'Ejercicios', width: 120 },
    { field: 'clientes', headerName: 'Clientes', width: 120 },
    { field: 'creada', headerName: 'Creada', width: 120 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <div>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => navigate(`/entrenador/rutinas/${params.row.id}`)}
            sx={{ mr: 1 }}
          >
            Ver
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            size="small"
            onClick={() => navigate(`/entrenador/rutinas/${params.row.id}/asignar`)}
          >
            Asignar
          </Button>
        </div>
      ),
    },
  ];

  const filteredRutinas = rutinas.filter(rutina =>
    Object.values(rutina).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="entrenador-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Mis Rutinas
        </Typography>
        <div>
          <Button 
            variant={view === 'grid' ? 'contained' : 'outlined'} 
            onClick={() => setView('grid')}
            size="small"
            sx={{ mr: 1 }}
          >
            Cuadrícula
          </Button>
          <Button 
            variant={view === 'list' ? 'contained' : 'outlined'} 
            onClick={() => setView('list')}
            size="small"
          >
            Lista
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/entrenador/rutinas/nueva')}
            sx={{ ml: 2 }}
          >
            Nueva Rutina
          </Button>
        </div>
      </Box>

      <Box mb={3}>
        <TextField
          variant="outlined"
          placeholder="Buscar rutinas..."
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

      {view === 'list' ? (
        <div style={{ height: 500, width: '100%', backgroundColor: 'white' }}>
          <DataGrid
            rows={filteredRutinas}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            loading={loading}
            disableSelectionOnClick
          />
        </div>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
          {filteredRutinas.map((rutina) => (
            <Card key={rutina.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <FitnessCenter color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {rutina.nombre}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {rutina.descripcion}
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={2} mb={1}>
                  <Chip 
                    label={rutina.nivel} 
                    size="small"
                    color={
                      rutina.nivel === 'Principiante' ? 'primary' : 
                      rutina.nivel === 'Intermedio' ? 'secondary' : 'default'
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    {rutina.ejercicios} ejercicios
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {rutina.clientes} clientes • Creada: {rutina.creada}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  onClick={() => navigate(`/entrenador/rutinas/${rutina.id}`)}
                >
                  Ver detalles
                </Button>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate(`/entrenador/rutinas/${rutina.id}/asignar`)}
                >
                  Asignar
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
};

export default Rutinas;
