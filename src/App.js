import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import AdminPanel from './AdminPanel';
import TrainerPanel from './TrainerPanel';
import ClientPanel from './ClientPanel';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const handleLogout = () => setUser(null);

  let panel = null;
  if (user.role === 'admin') {
    panel = <AdminPanel onLogout={handleLogout} />;
  } else if (user.role === 'trainer') {
    panel = <TrainerPanel onLogout={handleLogout} />;
  } else if (user.role === 'client') {
    panel = <ClientPanel onLogout={handleLogout} />;
  }

  return (
    <div className="App">
      {panel}
    </div>
  );
}

export default App;
