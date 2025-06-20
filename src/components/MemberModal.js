import React, { useState } from 'react';
import { Modal, Box, IconButton, Tooltip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddMemberForm from './AddMemberForm';

const icons = [
  { icon: <PeopleIcon />, label: 'Miembros' },
  { icon: <BadgeIcon />, label: 'Identificación' },
  { icon: <EditIcon />, label: 'Editar' },
  { icon: <CategoryIcon />, label: 'Categoría' },
  { icon: <MonetizationOnIcon />, label: 'Pagos' },
  { icon: <CalendarTodayIcon />, label: 'Calendario' },
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

const MemberModal = ({ onMemberCreated }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {icons.map((item, idx) => (
          <Tooltip title={item.label} key={item.label}>
            <IconButton
              onClick={handleOpen}
              sx={{ background: '#f5f5f5', borderRadius: 2, '&:hover': { background: '#e3f2fd' } }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <AddMemberForm onMemberCreated={() => { handleClose(); if (onMemberCreated) onMemberCreated(); }} />
        </Box>
      </Modal>
    </>
  );
};

export default MemberModal;
