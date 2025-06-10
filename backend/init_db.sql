-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS gym_db;

-- Usar la base de datos
USE gym_db;

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema con acceso total'),
('entrenador', 'Personal que puede gestionar rutinas y seguimiento de clientes'),
('recepcionista', 'Personal de recepción que gestiona asistencias y pagos'),
('cliente', 'Usuario regular del gimnasio');

-- Crear tabla de miembros
CREATE TABLE IF NOT EXISTS miembros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_inscripcion DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    rol_id INT NOT NULL DEFAULT 4, -- Por defecto es cliente
    password_hash VARCHAR(255), -- Para autenticación
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar datos de ejemplo de miembros con roles
INSERT INTO miembros (nombre, email, telefono, fecha_inscripcion, rol_id, password_hash) VALUES
('Admin Principal', 'admin@gym.com', '1234567890', CURDATE() - INTERVAL 30 DAY, 1, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'), -- password: admin123
('Entrenador Principal', 'entrenador@gym.com', '0987654321', CURDATE() - INTERVAL 20 DAY, 2, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('Recepcionista', 'recepcion@gym.com', '5551234567', CURDATE() - INTERVAL 15 DAY, 3, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('Cliente Ejemplo', 'cliente@example.com', '5559876543', CURDATE() - INTERVAL 2 DAY, 4, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'); -- password: admin123

-- Crear tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar permisos básicos
INSERT INTO permisos (nombre, descripcion) VALUES
('gestionar_usuarios', 'Puede crear, editar y eliminar usuarios'),
('gestionar_roles', 'Puede gestionar roles y permisos'),
('gestionar_clientes', 'Puede gestionar clientes'),
('gestionar_pagos', 'Puede registrar y ver pagos'),
('gestionar_asistencias', 'Puede registrar asistencias'),
('ver_reportes', 'Puede ver reportes y estadísticas');

-- Tabla intermedia para roles y permisos
CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Asignar permisos a roles
-- Admin: todos los permisos
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- Entrenador: gestionar clientes, ver reportes
INSERT INTO rol_permisos (rol_id, permiso_id) VALUES
(2, 3), (2, 6);

-- Recepcionista: gestionar clientes, pagos, asistencias
INSERT INTO rol_permisos (rol_id, permiso_id) VALUES
(3, 3), (3, 4), (3, 5);

-- Cliente: sin permisos especiales
-- No se asignan permisos al rol de cliente
