import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL;

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      });

      const { user, token } = response.data;
      
      // Guardar el token en localStorage
      localStorage.setItem('token', token);
      
      // Mapear los roles del backend a los roles del frontend
      const roleMap = {
        'admin': 'admin',
        'entrenador': 'trainer',
        'cliente': 'client'
      };
      
      onLogin({
        id: user.id,
        email: user.email,
        name: user.nombre,
        role: roleMap[user.rol_nombre] || 'client',
        token
      });
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error de conexión con el servidor';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
