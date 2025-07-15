import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';

const ListaClientes = ({ 
  clientes, 
  loading, 
  onEdit, 
  onDelete, 
  onView, 
  onAddNew,
  onRefresh
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = [
    { 
      field: 'nombreCompleto', 
      headerName: 'Nombre', 
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => 
        `${params.row.nombre || ''} ${params.row.apellidoPaterno || ''} ${params.row.apellidoMaterno || ''}`.trim()
    },
    { 
      field: 'email', 
      headerName: 'Correo', 
      flex: 1,
      minWidth: 200
    },
    { 
      field: 'telefono', 
      headerName: 'Teléfono', 
      width: 150 
    },
    {
      field: 'estadoMembresia',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => {
        const estado = params.value?.toLowerCase() || 'inactivo';
        const color = estado === 'activo' ? 'success' : 'error';
        return <Chip label={estado.toUpperCase()} color={color} size="small" />;
      },
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ver detalles">
            <IconButton onClick={() => onView(params.row)} size="small">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton onClick={() => onEdit(params.row)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton 
              onClick={() => onDelete(params.row)} 
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={onAddNew}
            sx={{ mr: 1 }}
          >
            Nuevo Cliente
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ height: 'calc(100% - 56px)', width: '100%' }}>
        <DataGrid
          rows={clientes}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          disableColumnMenu={isMobile}
          components={{
            Toolbar: GridToolbar,
          }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            '& .MuiButton-textPrimary': {
              color: theme.palette.primary.main,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ListaClientes;
