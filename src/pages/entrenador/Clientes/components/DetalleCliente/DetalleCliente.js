import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  Box,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  CardMembership as MembershipIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Note as NoteIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DetalleCliente = ({ 
  open, 
  onClose, 
  cliente, 
  onEdit,
  onDelete 
}) => {
  if (!cliente) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getMembresiaStatus = () => {
    if (!cliente.fechaFinMembresia) return { status: 'Inactiva', color: 'error' };
    
    const hoy = new Date();
    const finMembresia = new Date(cliente.fechaFinMembresia);
    
    if (finMembresia < hoy) {
      return { status: 'Vencida', color: 'error' };
    }
    
    const diasRestantes = Math.ceil((finMembresia - hoy) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes <= 7) {
      return { 
        status: `Por vencer (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'})`,
        color: 'warning'
      };
    }
    
    return { status: 'Activa', color: 'success' };
  };

  const { status: estadoMembresia, color: colorMembresia } = getMembresiaStatus();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {cliente.nombre} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Sección de información personal */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {cliente.nombre?.charAt(0)}{cliente.apellidoPaterno?.charAt(0)}
                </Avatar>
                <Chip 
                  label={estadoMembresia} 
                  color={colorMembresia} 
                  size="small" 
                  sx={{ mb: 1 }}
                />
                <Typography variant="subtitle1" color="textSecondary">
                  Miembro desde: {formatDate(cliente.fechaCreacion)}
                </Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><EmailIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Correo Electrónico" 
                    secondary={cliente.email || 'No especificado'} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon><PhoneIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Teléfono" 
                    secondary={cliente.telefono || 'No especificado'} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon><CakeIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Fecha de Nacimiento" 
                    secondary={formatDate(cliente.fechaNacimiento)} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon><GenderIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Género" 
                    secondary={cliente.genero ? 
                      cliente.genero.charAt(0).toUpperCase() + cliente.genero.slice(1) : 
                      'No especificado'
                    } 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          {/* Sección de membresía */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <MembershipIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Membresía</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EventAvailableIcon color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="Inicio de Membresía" 
                        secondary={formatDate(cliente.fechaInicioMembresia)} 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemIcon><EventBusyIcon color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="Fin de Membresía" 
                        secondary={formatDate(cliente.fechaFinMembresia)} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EventIcon color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="Tipo de Membresía" 
                        secondary={cliente.tipoMembresia ? 
                          cliente.tipoMembresia.charAt(0).toUpperCase() + cliente.tipoMembresia.slice(1) : 
                          'No especificada'
                        } 
                      />
                    </ListItem>
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemIcon><EventIcon color="action" /></ListItemIcon>
                      <ListItemText 
                        primary="Estado" 
                        secondary={
                          <Chip 
                            label={estadoMembresia} 
                            color={colorMembresia} 
                            size="small" 
                          />
                        } 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Sección de dirección */}
            <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <HomeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Dirección</Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemIcon><LocationIcon color="action" /></ListItemIcon>
                  <ListItemText 
                    primary="Dirección" 
                    secondary={cliente.direccion || 'No especificada'} 
                  />
                </ListItem>
                <Divider component="li" />
                
                <Grid container>
                  <Grid item xs={6}>
                    <ListItem>
                      <ListItemText 
                        primary="Ciudad" 
                        secondary={cliente.ciudad || 'No especificada'} 
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                      <ListItemText 
                        primary="Código Postal" 
                        secondary={cliente.codigoPostal || 'No especificado'} 
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              </List>
            </Paper>
            
            {/* Sección de notas */}
            {cliente.notas && (
              <Paper elevation={0} sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <NoteIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Notas</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {cliente.notas}
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button 
          onClick={() => onEdit(cliente)} 
          variant="contained" 
          color="primary"
          startIcon={<EditIcon />}
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetalleCliente;
