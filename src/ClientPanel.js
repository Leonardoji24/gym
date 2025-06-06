import React from 'react';

const ClientPanel = ({ onLogout }) => (
  <div style={{ padding: 40 }}>
    <h2>Panel de Clientes</h2>
    <p>Bienvenido, cliente. Aquí puedes ver tus rutinas y progreso.</p>
    <button onClick={onLogout} style={{marginTop: 20, padding: '10px 20px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Cerrar sesión</button>
  </div>
);

export default ClientPanel;
