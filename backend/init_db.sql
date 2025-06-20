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
    -- Admin
    permisos_especiales TEXT,
    -- Cliente
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    direccion VARCHAR(255),
    tipo_membresia VARCHAR(50),
    fecha_vencimiento_membresia DATE,
    -- Entrenador
    especialidad VARCHAR(100),
    horario_trabajo VARCHAR(100),
    certificaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar datos de ejemplo de miembros con roles
INSERT INTO miembros (
    nombre, email, telefono, fecha_inscripcion, activo, rol_id, password_hash,
    permisos_especiales, fecha_nacimiento, genero, direccion, tipo_membresia, fecha_vencimiento_membresia,
    especialidad, horario_trabajo, certificaciones
) VALUES
-- Admin
('Admin Principal', 'admin@gym.com', '1234567890', CURDATE() - INTERVAL 30 DAY, 1, 1, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
 'Puede gestionar todo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
-- Entrenador
('Entrenador Principal', 'entrenador@gym.com', '0987654321', CURDATE() - INTERVAL 20 DAY, 1, 2, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
 NULL, NULL, NULL, NULL, NULL, NULL, 'Pesas y Cardio', 'Lunes a Viernes 7-15', 'Certificación A, Certificación B'),
-- Cliente
('Cliente Ejemplo', 'cliente@example.com', '5559876543', CURDATE() - INTERVAL 2 DAY, 1, 4, '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
 NULL, '2000-05-15', 'Femenino', 'Calle Falsa 123', 'Mensual', CURDATE() + INTERVAL 28 DAY, NULL, NULL, NULL);
-- Las contraseñas hash corresponden a: admin123 -- password: admin123

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

-- Cliente: sin permisos especiales
-- No se asignan permisos al rol de cliente

-- Crear tabla de clases
CREATE TABLE IF NOT EXISTS clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    horario VARCHAR(100),
    cupo_maximo INT,
    id_entrenador INT,
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id_entrenador) REFERENCES miembros(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Crear tabla de inventario
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('equipo','suplemento','otro') NOT NULL,
    cantidad INT DEFAULT 0,
    descripcion TEXT,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado ENUM('activo','en reparacion','agotado','dado de baja') DEFAULT 'activo',
    proveedor VARCHAR(100),
    ubicacion VARCHAR(100),
    precio_unitario DECIMAL(10,2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Crear tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    miembro_id INT NOT NULL,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME,
    tipo_asistencia ENUM('entrenamiento', 'clase', 'otro') NOT NULL DEFAULT 'entrenamiento',
    notas TEXT,
    creado_por INT, -- ID del usuario que registró la asistencia (si aplica)
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES miembros(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Índices para búsquedas rápidas
CREATE INDEX idx_asistencias_miembro ON asistencias(miembro_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha_hora_entrada);

-- Insertar algunos datos de ejemplo
INSERT INTO asistencias (miembro_id, fecha_hora_entrada, fecha_hora_salida, tipo_asistencia, notas, creado_por)
VALUES 
(4, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 1 HOUR, 'entrenamiento', 'Entrenamiento de rutina A', 3),
(4, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR, 'clase', 'Clase de spinning', 2),
(4, NOW(), NULL, 'entrenamiento', 'En entrenamiento actual', 3);

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    miembro_id INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    estado ENUM('pagada','pendiente','cancelada') DEFAULT 'pendiente',
    metodo_pago VARCHAR(50),
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar datos de ejemplo en facturas
INSERT INTO facturas (miembro_id, fecha, total, concepto, estado, metodo_pago, notas) VALUES
(4, CURDATE() - INTERVAL 5 DAY, 500.00, 'Membresía mensual', 'pagada', 'efectivo', 'Pago realizado en mostrador'),
(4, CURDATE() - INTERVAL 1 DAY, 600.00, 'Membresía mensual', 'pendiente', 'tarjeta', 'Pago pendiente de confirmación');
