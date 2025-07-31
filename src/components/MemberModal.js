import React, { useState } from 'react';
import { Modal, Box, IconButton, Tooltip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddMemberForm from './acciones/AddMemberForm';

const icons = [
  { 
    icon: <PeopleIcon />, 
    label: 'Nuevo Miembro',
    type: 'create'
  },
  { 
    icon: <EditIcon />, 
    label: 'Editar Miembro',
    type: 'edit'
  },
  { 
    icon: <MonetizationOnIcon />, 
    label: 'Pagos',
    type: 'payments'
  },
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #1976d2',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const MemberModal = ({ onMemberCreated, selectedMember, onSelectMember }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' o 'edit'

  const handleOpen = (mode) => {
    if (mode === 'edit' && !selectedMember) {
      // No hacer nada si no hay miembro seleccionado
      return;
    }
    setMode(mode);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Limpiar el miembro seleccionado al cerrar
    if (onSelectMember) onSelectMember(null);
  };

  const handleMemberCreated = () => {
    handleClose();
    if (onMemberCreated) onMemberCreated();
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {icons.map((item) => (
          <Tooltip title={item.label} key={item.type}>
            <span>
              <IconButton
                onClick={() => handleOpen(item.type)}
                disabled={item.disabled}
                sx={{ 
                  background: '#f5f5f5', 
                  borderRadius: 2, 
                  '&:hover': { background: '#e3f2fd' },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {item.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <AddMemberForm 
            memberData={mode === 'edit' ? selectedMember : null}
            onMemberCreated={handleMemberCreated} 
            mode={mode}
          />
        </Box>
      </Modal>
    </>
  );
};

export default MemberModal;
