import React from 'react';

const TrainerPanel = ({ onLogout }) => (
  <div style={{ padding: 40 }}>
    <h2>Panel de Entrenadores</h2>
    <p>Bienvenido, entrenador. Aquí puedes gestionar tus clases y clientes.</p>
    <button onClick={onLogout} style={{marginTop: 20, padding: '10px 20px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Cerrar sesión</button>
  </div>
);

export default TrainerPanel;
