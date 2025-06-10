import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClientPanel = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/', { replace: true }); // Redirigir a la ruta raíz después de cerrar sesión
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Panel de Clientes</h2>
      <p>Bienvenido, cliente. Aquí puedes ver tus rutinas y progreso.</p>
      <button 
        onClick={handleLogout} 
        style={{
          marginTop: 20, 
          padding: '10px 20px', 
          background: '#d32f2f', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 4, 
          cursor: 'pointer'
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default ClientPanel;
