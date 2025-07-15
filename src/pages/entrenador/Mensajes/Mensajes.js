import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Badge, 
  IconButton,
  Paper,
  InputAdornment
} from '@mui/material';
import { Send as SendIcon, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Mensajes = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo (reemplazar con llamada a la API)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Simular carga de datos
        setTimeout(() => {
          const data = [
            {
              id: 1,
              clientId: 101,
              name: 'Juan Pérez',
              lastMessage: 'Hola, ¿cómo estás?',
              time: '10:30 AM',
              unread: 2,
              avatar: '/avatars/1.jpg',
              messages: [
                { id: 1, sender: 'client', text: 'Hola, ¿cómo estás?', time: '10:30 AM' },
                { id: 2, sender: 'me', text: '¡Hola Juan! Estoy bien, ¿y tú?', time: '10:32 AM' },
                { id: 3, sender: 'client', text: 'Todo bien por aquí. ¿Podrías revisar mi rutina?', time: '10:33 AM' },
              ]
            },
            {
              id: 2,
              clientId: 102,
              name: 'María García',
              lastMessage: 'Gracias por la ayuda',
              time: 'Ayer',
              unread: 0,
              avatar: '/avatars/2.jpg',
              messages: [
                { id: 1, sender: 'client', text: 'Hola, ¿tienes un momento?', time: 'Ayer' },
                { id: 2, sender: 'me', text: 'Claro, ¿en qué puedo ayudarte?', time: 'Ayer' },
                { id: 3, sender: 'client', text: 'Gracias por la ayuda', time: 'Ayer' },
              ]
            },
            {
              id: 3,
              clientId: 103,
              name: 'Carlos López',
              lastMessage: '¿A qué hora es la clase?',
              time: 'Lun',
              unread: 1,
              avatar: '/avatars/3.jpg',
              messages: [
                { id: 1, sender: 'client', text: 'Buenos días', time: 'Lun' },
                { id: 2, sender: 'client', text: '¿A qué hora es la clase?', time: 'Lun' },
              ]
            },
          ];
          setConversations(data);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Aquí iría la lógica para enviar el mensaje
    console.log('Mensaje enviado:', newMessage);
    
    // Actualizar la conversación actual con el nuevo mensaje
    if (selectedConversation) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            lastMessage: newMessage,
            time: 'Ahora',
            messages: [
              ...conv.messages,
              { 
                id: conv.messages.length + 1, 
                sender: 'me', 
                text: newMessage, 
                time: 'Ahora' 
              }
            ]
          };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      setSelectedConversation({
        ...selectedConversation,
        messages: [
          ...selectedConversation.messages,
          { 
            id: selectedConversation.messages.length + 1, 
            sender: 'me', 
            text: newMessage, 
            time: 'Ahora' 
          }
        ]
      });
    }
    
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="entrenador-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Mensajes
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/entrenador/mensajes/nuevo')}
        >
          Nuevo Mensaje
        </Button>
      </Box>

      <Box display="flex" sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Lista de conversaciones */}
        <Paper 
          elevation={3} 
          sx={{ 
            width: 350, 
            mr: 2, 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <Box p={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar conversaciones..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            <List>
              {filteredConversations.map((conversation) => (
                <React.Fragment key={conversation.id}>
                  <ListItem 
                    button 
                    selected={selectedConversation?.id === conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge 
                        color="primary" 
                        variant="dot" 
                        invisible={conversation.unread === 0}
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar src={conversation.avatar} alt={conversation.name} />
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" noWrap sx={{ fontWeight: conversation.unread > 0 ? 'bold' : 'normal' }}>
                            {conversation.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            color: conversation.unread > 0 ? 'primary.main' : 'text.secondary',
                            fontWeight: conversation.unread > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {conversation.lastMessage}
                        </Typography>
                      }
                      primaryTypographyProps={{ noWrap: true }}
                      sx={{ pr: 1 }}
                    />
                    {conversation.unread > 0 && (
                      <Box 
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {conversation.unread}
                      </Box>
                    )}
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Área de chat */}
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {selectedConversation ? (
            <>
              {/* Encabezado del chat */}
              <Box 
                p={2} 
                sx={{ 
                  borderBottom: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }}
              >
                <Avatar 
                  src={selectedConversation.avatar} 
                  alt={selectedConversation.name} 
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {selectedConversation.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    En línea
                  </Typography>
                </Box>
              </Box>
              
              {/* Mensajes */}
              <Box 
                sx={{ 
                  flex: 1, 
                  p: 2, 
                  overflowY: 'auto',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29-22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                }}
              >
                {selectedConversation.messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: message.sender === 'me' ? 'primary.main' : 'background.paper',
                        color: message.sender === 'me' ? 'primary.contrastText' : 'text.primary',
                        boxShadow: 1,
                        position: 'relative',
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                      <Typography 
                        variant="caption" 
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          color: message.sender === 'me' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
                        {message.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Área de envío de mensajes */}
              <Box 
                p={2} 
                sx={{ 
                  borderTop: '1px solid #e0e0e0',
                  backgroundColor: 'background.paper',
                }}
              >
                <Box display="flex" alignItems="center">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Escribe un mensaje..."
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{ mr: 1 }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              height="100%"
              textAlign="center"
              p={4}
            >
              <i className="bi bi-chat-square-text" style={{ fontSize: '4rem', color: '#e0e0e0', marginBottom: '1rem' }}></i>
              <Typography variant="h6" color="text.secondary">
                Selecciona una conversación o inicia una nueva
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: '400px' }}>
                Puedes ver tus mensajes existentes o comenzar una nueva conversación con un cliente.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/entrenador/mensajes/nuevo')}
                sx={{ mt: 3 }}
              >
                Nuevo Mensaje
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default Mensajes;
