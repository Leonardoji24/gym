# Documentación de Integración Backend-Frontend

## Configuración de CORS

### Backend (Flask)
- Puerto: 3306
- Orígenes permitidos: `http://localhost:3306` y `http://192.168.1.135:3306`
- Métodos permitidos: GET, POST, PUT, DELETE, OPTIONS
- Headers permitidos: Content-Type, Authorization

### Frontend (React)
- URL base de la API: `http://192.168.1.135:3306/api`
- Timeout: 10 segundos
- Conexión con credenciales: true

## Endpoints Disponibles

### Autenticación
- POST /api/auth/login
- GET /api/auth/me

### Miembros
- GET /api/miembros
- POST /api/miembros

### Asistencias
- GET /api/asistencias
- POST /api/asistencias
- PUT /api/asistencias/<id>/salida

## Consideraciones Importantes
1. Todas las peticiones requieren autenticación (excepto el login)
2. Los tokens JWT se envían en el header Authorization
3. El backend está configurado para manejar CORS y credenciales
4. La base de datos está configurada para aceptar conexiones desde el servidor Flask
