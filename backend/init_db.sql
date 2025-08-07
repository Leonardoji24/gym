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
    rol_id INT NOT NULL DEFAULT 3, -- Por defecto es cliente (id=3)
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

-- Crear tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    miembro_id INT NOT NULL,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME DEFAULT NULL,
    tipo_asistencia VARCHAR(50) DEFAULT 'entrenamiento',
    notas TEXT,
    creado_por INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (miembro_id) REFERENCES miembros(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES miembros(id)
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

ALTER TABLE miembros ADD COLUMN observaciones TEXT;
ALTER TABLE miembros ADD COLUMN condiciones_medicas TEXT;

-- ===========================================
-- TABLAS PARA EL SISTEMA DE RUTINAS
-- ===========================================

-- Tabla de categorías de ejercicios
CREATE TABLE IF NOT EXISTS categorias_ejercicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar categorías básicas
INSERT INTO categorias_ejercicios (nombre, descripcion, icono, color) VALUES
('Tren Superior', 'Ejercicios para pecho, espalda, hombros y brazos', 'fitness-center', '#3b82f6'),
('Tren Inferior', 'Ejercicios para piernas y glúteos', 'directions-run', '#10b981'),
('Core', 'Ejercicios para abdominales y lumbares', 'accessibility', '#f59e0b'),
('Cardio', 'Ejercicios cardiovasculares', 'favorite', '#ef4444'),
('Flexibilidad', 'Estiramientos y movilidad', 'self-improvement', '#8b5cf6'),
('Full Body', 'Ejercicios que trabajan todo el cuerpo', 'all-inclusive', '#06b6d4');

-- Tabla de ejercicios
CREATE TABLE IF NOT EXISTS ejercicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_id INT NOT NULL,
    nivel ENUM('principiante', 'intermedio', 'avanzado') DEFAULT 'principiante',
    tipo_ejercicio ENUM('fuerza', 'cardio', 'flexibilidad', 'funcional') DEFAULT 'fuerza',
    equipamiento_necesario TEXT,
    instrucciones TEXT,
    video_url VARCHAR(255),
    imagen_url VARCHAR(255),
    calorias_por_minuto DECIMAL(5,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias_ejercicios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar ejercicios de ejemplo
INSERT INTO ejercicios (nombre, descripcion, categoria_id, nivel, tipo_ejercicio, equipamiento_necesario, instrucciones, calorias_por_minuto) VALUES
-- Tren Superior
('Flexiones', 'Ejercicio básico para pecho y tríceps', 1, 'principiante', 'fuerza', 'Ninguno', 'Colócate en posición de plancha y baja el cuerpo', 8.0),
('Fondos en silla', 'Ejercicio para tríceps usando una silla', 1, 'principiante', 'fuerza', 'Silla', 'Apoya las manos en la silla y baja el cuerpo', 6.0),
('Pull-ups', 'Dominadas para espalda y brazos', 1, 'avanzado', 'fuerza', 'Barra de dominadas', 'Cuelga de la barra y levanta el cuerpo', 10.0),
('Press de banca', 'Ejercicio con barra para pecho', 1, 'intermedio', 'fuerza', 'Barra, pesas, banco', 'Acuéstate en el banco y levanta la barra', 12.0),

-- Tren Inferior
('Sentadillas', 'Ejercicio básico para piernas', 2, 'principiante', 'fuerza', 'Ninguno', 'Ponte de pie y baja como si te sentaras', 7.0),
('Zancadas', 'Ejercicio para piernas y glúteos', 2, 'principiante', 'fuerza', 'Ninguno', 'Da un paso hacia adelante y baja', 8.0),
('Peso muerto', 'Ejercicio para espalda y piernas', 2, 'avanzado', 'fuerza', 'Barra, pesas', 'Levanta la barra desde el suelo', 15.0),
('Sentadilla búlgara', 'Variación avanzada de sentadilla', 2, 'avanzado', 'fuerza', 'Banco, pesas', 'Apoya un pie en el banco y haz sentadilla', 12.0),

-- Core
('Plancha', 'Ejercicio isométrico para core', 3, 'principiante', 'fuerza', 'Ninguno', 'Mantén el cuerpo recto en posición de plancha', 4.0),
('Crunch', 'Abdominales básicos', 3, 'principiante', 'fuerza', 'Ninguno', 'Acuéstate y levanta los hombros', 5.0),
('Russian Twist', 'Rotación de torso para oblicuos', 3, 'intermedio', 'fuerza', 'Peso opcional', 'Gira el torso de lado a lado', 6.0),

-- Cardio
('Burpees', 'Ejercicio completo de cardio', 4, 'intermedio', 'cardio', 'Ninguno', 'Combina sentadilla, flexión y salto', 12.0),
('Jumping Jacks', 'Saltos con apertura de piernas', 4, 'principiante', 'cardio', 'Ninguno', 'Salta abriendo y cerrando piernas', 8.0),
('Mountain Climbers', 'Correr en posición de plancha', 4, 'intermedio', 'cardio', 'Ninguno', 'Alterna las rodillas hacia el pecho', 10.0),

-- Flexibilidad
('Estiramiento de isquios', 'Estiramiento para parte posterior de piernas', 5, 'principiante', 'flexibilidad', 'Ninguno', 'Toca los dedos de los pies', 3.0),
('Estiramiento de cuádriceps', 'Estiramiento para parte anterior de piernas', 5, 'principiante', 'flexibilidad', 'Ninguno', 'Agarra el pie y tira hacia atrás', 3.0),

-- Full Body
('Thruster', 'Combinación de sentadilla y press', 6, 'avanzado', 'funcional', 'Pesas', 'Combina sentadilla con press de hombros', 14.0),
('Burpee con pull-up', 'Combinación de burpee y dominada', 6, 'avanzado', 'funcional', 'Barra de dominadas', 'Burpee seguido de una dominada', 16.0);

-- Tabla de rutinas
CREATE TABLE IF NOT EXISTS rutinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    nivel ENUM('principiante', 'intermedio', 'avanzado') DEFAULT 'principiante',
    objetivo ENUM('perdida_peso', 'ganancia_muscular', 'resistencia', 'fuerza', 'flexibilidad', 'salud_general') DEFAULT 'salud_general',
    duracion_semanas INT DEFAULT 4,
    frecuencia_semanal INT DEFAULT 3,
    tiempo_estimado INT, -- en minutos
    equipamiento_necesario TEXT,
    calorias_estimadas INT,
    id_entrenador INT,
    es_plantilla BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_entrenador) REFERENCES miembros(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar rutinas de ejemplo
INSERT INTO rutinas (nombre, descripcion, nivel, objetivo, duracion_semanas, frecuencia_semanal, tiempo_estimado, equipamiento_necesario, calorias_estimadas, id_entrenador, es_plantilla) VALUES
('Rutina Básica 3x3', 'Rutina para principiantes que quieren empezar a entrenar', 'principiante', 'salud_general', 4, 3, 30, 'Ninguno', 200, 5, TRUE),
('Rutina de Fuerza 5x5', 'Programa clásico de fuerza para intermedios', 'intermedio', 'fuerza', 8, 3, 45, 'Barra, pesas, banco', 300, 5, TRUE),
('HIIT Cardio', 'Entrenamiento de alta intensidad para quemar grasa', 'intermedio', 'perdida_peso', 6, 4, 20, 'Ninguno', 250, 5, TRUE),
('Rutina Avanzada Push-Pull', 'Rutina avanzada dividida por grupos musculares', 'avanzado', 'ganancia_muscular', 12, 4, 60, 'Gimnasio completo', 400, 5, TRUE);

-- Tabla de días de rutina
CREATE TABLE IF NOT EXISTS dias_rutina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rutina_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rutina_id) REFERENCES rutinas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar días de rutina para las rutinas de ejemplo
INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden) VALUES
-- Rutina Básica 3x3
(1, 'Día 1 - Tren Superior', 'Enfoque en pecho, espalda y brazos', 1),
(1, 'Día 2 - Tren Inferior', 'Enfoque en piernas y glúteos', 2),
(1, 'Día 3 - Cardio', 'Entrenamiento cardiovascular', 3),

-- Rutina de Fuerza 5x5
(2, 'Día A - Sentadilla y Press', 'Sentadilla, press de banca, peso muerto', 1),
(2, 'Día B - Sentadilla y Press', 'Sentadilla, press militar, peso muerto', 2),

-- HIIT Cardio
(3, 'Entrenamiento HIIT', 'Circuito de alta intensidad', 1),

-- Rutina Avanzada Push-Pull
(4, 'Push - Empujar', 'Pecho, hombros, tríceps', 1),
(4, 'Pull - Jalar', 'Espalda, bíceps', 2),
(4, 'Piernas', 'Tren inferior completo', 3),
(4, 'Cardio', 'Entrenamiento cardiovascular', 4);

-- Tabla de ejercicios en días de rutina
CREATE TABLE IF NOT EXISTS ejercicios_rutina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_rutina_id INT NOT NULL,
    ejercicio_id INT NOT NULL,
    series INT DEFAULT 3,
    repeticiones VARCHAR(20) DEFAULT '10-12',
    peso VARCHAR(50), -- Puede ser porcentaje, peso específico, o "sin peso"
    tiempo_ejercicio INT, -- en segundos, para ejercicios de tiempo
    tiempo_descanso INT DEFAULT 60, -- en segundos
    orden INT DEFAULT 1,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dia_rutina_id) REFERENCES dias_rutina(id) ON DELETE CASCADE,
    FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Insertar ejercicios en las rutinas
INSERT INTO ejercicios_rutina (dia_rutina_id, ejercicio_id, series, repeticiones, peso, tiempo_descanso, orden) VALUES
-- Rutina Básica 3x3 - Día 1
(1, 1, 3, '5-10', 'sin peso', 90, 1), -- Flexiones
(1, 2, 3, '8-12', 'sin peso', 90, 2), -- Fondos en silla
(1, 9, 3, '30 seg', 'sin peso', 60, 3), -- Plancha

-- Rutina Básica 3x3 - Día 2
(2, 5, 3, '10-15', 'sin peso', 90, 1), -- Sentadillas
(2, 6, 3, '10 por pierna', 'sin peso', 90, 2), -- Zancadas
(2, 10, 3, '15-20', 'sin peso', 60, 3), -- Crunch

-- Rutina Básica 3x3 - Día 3
(3, 13, 3, '30 seg', 'sin peso', 30, 1), -- Jumping Jacks
(3, 14, 3, '30 seg', 'sin peso', 30, 2), -- Mountain Climbers
(3, 12, 3, '10', 'sin peso', 60, 3), -- Burpees

-- Rutina de Fuerza 5x5 - Día A
(4, 5, 5, '5', '80% 1RM', 180, 1), -- Sentadillas
(4, 4, 5, '5', '80% 1RM', 180, 2), -- Press de banca
(4, 7, 1, '5', '80% 1RM', 300, 3), -- Peso muerto

-- Rutina de Fuerza 5x5 - Día B
(5, 5, 5, '5', '80% 1RM', 180, 1), -- Sentadillas
(5, 4, 5, '5', '80% 1RM', 180, 2), -- Press militar (usando press de banca como ejemplo)
(5, 7, 1, '5', '80% 1RM', 300, 3), -- Peso muerto

-- HIIT Cardio
(6, 12, 5, '30 seg', 'sin peso', 15, 1), -- Burpees
(6, 14, 5, '30 seg', 'sin peso', 15, 2), -- Mountain Climbers
(6, 13, 5, '30 seg', 'sin peso', 15, 3), -- Jumping Jacks

-- Rutina Avanzada Push-Pull - Push
(7, 1, 4, '8-12', 'sin peso', 120, 1), -- Flexiones
(7, 4, 4, '8-12', '80% 1RM', 120, 2), -- Press de banca
(7, 9, 3, '45 seg', 'sin peso', 60, 3), -- Plancha

-- Rutina Avanzada Push-Pull - Pull
(8, 3, 4, '8-12', 'sin peso', 120, 1), -- Pull-ups
(8, 9, 3, '45 seg', 'sin peso', 60, 2), -- Plancha

-- Rutina Avanzada Push-Pull - Piernas
(9, 5, 4, '8-12', 'sin peso', 120, 1), -- Sentadillas
(9, 6, 4, '10 por pierna', 'sin peso', 120, 2), -- Zancadas
(9, 7, 3, '5', '80% 1RM', 180, 3), -- Peso muerto

-- Rutina Avanzada Push-Pull - Cardio
(10, 12, 4, '30 seg', 'sin peso', 30, 1), -- Burpees
(10, 14, 4, '30 seg', 'sin peso', 30, 2); -- Mountain Climbers

-- Tabla de asignación de rutinas a clientes
CREATE TABLE IF NOT EXISTS rutinas_clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rutina_id INT NOT NULL,
    cliente_id INT NOT NULL,
    entrenador_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado ENUM('activa', 'pausada', 'completada', 'cancelada') DEFAULT 'activa',
    progreso_actual INT DEFAULT 0, -- Porcentaje de completado
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rutina_id) REFERENCES rutinas(id),
    FOREIGN KEY (cliente_id) REFERENCES miembros(id),
    FOREIGN KEY (entrenador_id) REFERENCES miembros(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Tabla de seguimiento de progreso
CREATE TABLE IF NOT EXISTS progreso_ejercicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rutina_cliente_id INT NOT NULL,
    ejercicio_id INT NOT NULL,
    fecha_ejecucion DATE NOT NULL,
    series_completadas INT DEFAULT 0,
    repeticiones_realizadas VARCHAR(20),
    peso_utilizado VARCHAR(50),
    tiempo_ejercicio INT, -- en segundos
    tiempo_descanso INT, -- en segundos
    dificultad_percibida INT, -- 1-10
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rutina_cliente_id) REFERENCES rutinas_clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Tabla de marcas personales
CREATE TABLE IF NOT EXISTS marcas_personales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    ejercicio_id INT NOT NULL,
    peso_maximo DECIMAL(8,2),
    repeticiones_maximas INT,
    tiempo_maximo INT, -- en segundos
    fecha_establecida DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES miembros(id) ON DELETE CASCADE,
    FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- Índices para optimizar consultas
CREATE INDEX idx_rutinas_entrenador ON rutinas(id_entrenador);
CREATE INDEX idx_rutinas_nivel ON rutinas(nivel);
CREATE INDEX idx_rutinas_objetivo ON rutinas(objetivo);
CREATE INDEX idx_ejercicios_categoria ON ejercicios(categoria_id);
CREATE INDEX idx_ejercicios_nivel ON ejercicios(nivel);
CREATE INDEX idx_rutinas_clientes_cliente ON rutinas_clientes(cliente_id);
CREATE INDEX idx_rutinas_clientes_entrenador ON rutinas_clientes(entrenador_id);
CREATE INDEX idx_progreso_fecha ON progreso_ejercicios(fecha_ejecucion);
CREATE INDEX idx_marcas_cliente ON marcas_personales(cliente_id);