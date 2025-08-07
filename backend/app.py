from flask import Flask, jsonify, request, make_response, render_template, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os
from functools import wraps
import jwt
from datetime import datetime, timedelta
import bcrypt

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configuración de la aplicación
app.config.update(
    # Configuración de JWT
    SECRET_KEY=os.getenv('SECRET_KEY', 'clave_secreta_predeterminada_cambiar_en_produccion'),
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
    JWT_ALGORITHM='HS256',
    
    # Configuración de CORS
    CORS_ORIGINS=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://192.168.10.53:3000').split(','),
    CORS_METHODS=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    CORS_ALLOW_HEADERS=['Content-Type', 'Authorization'],
    CORS_EXPOSE_HEADERS=['Content-Type', 'Authorization'],
    CORS_SUPPORTS_CREDENTIALS=True
)

# Configuración de CORS simplificada
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.20.29:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Configuración de la base de datos
def get_db_connection():
    try:
        print("Intentando conectar a la base de datos...")
        print(f"Host: {os.getenv('DB_HOST')}")
        print(f"Usuario: {os.getenv('DB_USER')}")
        print(f"Base de datos: {os.getenv('DB_NAME')}")
        
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD') or None,
            database=os.getenv('DB_NAME'),
            auth_plugin='mysql_native_password',
            connection_timeout=5
        )
        print("Conexión exitosa a la base de datos")
        return connection
    except Error as e:
        error_msg = f"Error al conectar a la base de datos: {e}"
        print(error_msg)
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # No requerir autenticación para rutas públicas
        public_routes = ['/api/auth/login', '/api/test']
        if request.path in public_routes:
            return f(None, *args, **kwargs)
            
        print("\n--- token_required iniciado ---")
        token = None
        
        # Obtener el token del header
        auth_header = request.headers.get('Authorization', '')
        
        # Verificar el formato del token
        if auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            print(f"Token extraído: {token[:10]}...")
        else:
            print("Error: Formato de token inválido")
            return jsonify({
                'success': False,
                'message': 'Formato de token inválido. Use: Bearer <token>'
            }), 401
        
        if not token:
            print("Error: No se proporcionó token")
            return jsonify({
                'success': False,
                'message': 'Se requiere un token para acceder a este recurso',
                'error': 'token_missing'
            }), 401
            
        try:
            print("Validando token...")
            # Decodificar el token
            data = jwt.decode(
                token,
                app.config['SECRET_KEY'],
                algorithms=['HS256'],
                options={"verify_exp": True}
            )
            
            current_user = data.get('email')
            if not current_user:
                raise jwt.InvalidTokenError('Email no encontrado en el token')
                
            print(f"Token válido para el usuario: {current_user}")
            
        except jwt.ExpiredSignatureError:
            print("Error: Token expirado")
            return jsonify({
                'success': False,
                'message': 'Token expirado',
                'error': 'token_expired'
            }), 401
            
        except jwt.InvalidTokenError as e:
            print(f"Error: Token inválido - {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Token inválido',
                'error': 'invalid_token'
            }), 401
            
        except Exception as e:
            print(f"Error inesperado al validar token: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Error al procesar la autenticación',
                'error': 'authentication_error'
            }), 500
        
        # Si todo está bien, continuar con la función protegida
        return f(current_user, *args, **kwargs)
    
    return decorated

# Ruta de autenticación
@app.route('/api/auth/login', methods=['POST'])
def login():
    print("Solicitud recibida en /api/auth/login")
    print("Headers:", request.headers)
    print("JSON recibido:", request.json)
    
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    auth = request.json
    
    if not auth or not auth.get('email') or not auth.get('password'):
        return jsonify({'error': 'Email y contraseña son requeridos'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Error al conectar a la base de datos"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT m.*, r.nombre as rol_nombre 
            FROM miembros m 
            JOIN roles r ON m.rol_id = r.id 
            WHERE m.email = %s
        """, (auth['email'].lower(),))  # Convertir email a minúsculas
        
        user = cursor.fetchone()
        
        if not user:
            # No revelar si el usuario existe o no por seguridad
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Verificar la contraseña con bcrypt
        try:
            # Verificar si el hash parece ser de bcrypt (debería comenzar con $2b$)
            if not user['password_hash'].startswith('$2b$'):
                print("Error: La contraseña no está hasheada correctamente")
                return jsonify({
                    'success': False,
                    'error': 'invalid_password_format',
                    'message': 'La contraseña no está en el formato correcto. Contacte al administrador.'
                }), 500
                
            # Verificar la contraseña
            if not bcrypt.checkpw(auth['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
                print("Error de autenticación: contraseña incorrecta")
                return jsonify({
                    'success': False,
                    'error': 'invalid_credentials',
                    'message': 'Credenciales inválidas'
                }), 401
                
        except Exception as e:
            print(f"Error al verificar contraseña: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'authentication_error',
                'message': f'Error en la autenticación: {str(e)}'
            }), 500
        
        # Generar token JWT
        token = jwt.encode({
            'email': user['email'],
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['SECRET_KEY'])
        
        # Eliminar datos sensibles
        user.pop('password_hash', None)
        
        print(f"Inicio de sesión exitoso para el usuario: {user['email']}")
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'token': token,
            'user': user
        })
        
    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({"error": "Error en el servidor"}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Ruta para obtener información del usuario actual
@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    print(f"\n--- Iniciando get_current_user ---")
    print(f"Usuario recibido del token: {current_user}")
    
    try:
        print("Conectando a la base de datos...")
        connection = get_db_connection()
        if not connection:
            print("Error: No se pudo conectar a la base de datos")
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        
        print("Conexión exitosa a la base de datos")
        cursor = connection.cursor(dictionary=True)
        
        print(f"Ejecutando consulta para el usuario: {current_user}")
        query = """
            SELECT m.*, r.nombre as rol_nombre 
            FROM miembros m 
            JOIN roles r ON m.rol_id = r.id 
            WHERE m.email = %s
        """
        print(f"Query: {query}")
        print(f"Parámetros: ({current_user},)")
        
        cursor.execute(query, (current_user,))
        user = cursor.fetchone()
        
        if not user:
            print(f"Usuario no encontrado en la base de datos: {current_user}")
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        print(f"Usuario encontrado en BD: {user}")
        
        # Mapear el rol al formato que espera el frontend
        role_map = {
            'admin': 'admin',
            'entrenador': 'trainer',
            'recepcionista': 'receptionist',
            'cliente': 'client'
        }
        
        # Asegurarse de que el rol_nombre existe
        if 'rol_nombre' not in user or not user['rol_nombre']:
            print("Advertencia: El usuario no tiene un rol definido")
            user['rol_nombre'] = 'cliente'  # Valor por defecto
        
        # Procesar condiciones médicas si existen
        condiciones_medicas = user.get('condiciones_medicas', '')
        if condiciones_medicas:
            try:
                # Intentar convertir el string JSON a lista
                if isinstance(condiciones_medicas, str):
                    condiciones_medicas = json.loads(condiciones_medicas)
            except (json.JSONDecodeError, TypeError, ValueError):
                # Si hay un error al decodificar, dejar como está
                pass
        
        # Crear respuesta en el formato que espera el frontend
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'nombre': user.get('nombre', ''),  # Usar get() para evitar KeyError
            'rol_nombre': user['rol_nombre'],
            'role': role_map.get(user['rol_nombre'].lower().strip(), 'client'),
            'condiciones_medicas': condiciones_medicas
        }
        
        print(f"Datos de usuario a devolver: {user_data}")
        return jsonify(user_data)
        
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Error en get_current_user: {str(e)}")
        print(f"Traceback: {error_traceback}")
        return jsonify({
            "error": "Error interno del servidor",
            "details": str(e),
            "traceback": error_traceback
        }), 500
    finally:
        try:
            if 'connection' in locals() and connection and connection.is_connected():
                if 'cursor' in locals():
                    cursor.close()
                connection.close()
                print("Conexión a la base de datos cerrada")
        except Exception as e:
            print(f"Error al cerrar la conexión: {e}")

# Ruta de prueba para verificar que el servidor está funcionando
@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"message": "Conexión exitosa al servidor Flask"}), 200

# Ruta para obtener todos los miembros

@app.route('/api/miembros/proximos_a_vencer', methods=['GET'])
@token_required
def miembros_proximos_a_vencer(current_user):
    try:
        dias = int(request.args.get('dias', 7))  # Por defecto, próximos 7 días
        hoy = datetime.now().date()
        limite = hoy + timedelta(days=dias)
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT m.* FROM miembros m
            WHERE m.fecha_vencimiento_membresia IS NOT NULL
              AND m.fecha_vencimiento_membresia >= %s
              AND m.fecha_vencimiento_membresia <= %s
              AND m.activo = 1
            ORDER BY m.fecha_vencimiento_membresia ASC
        '''
        cursor.execute(query, (hoy, limite))
        miembros = cursor.fetchall()
        return jsonify({'miembros': miembros, 'rango': f'{hoy} a {limite}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()
@app.route('/api/miembros', methods=['GET'])
@token_required
def get_miembros(current_user):
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Error al conectar a la base de datos"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Realizar JOIN con la tabla roles para obtener el nombre del rol
        query = """
            SELECT 
                m.id, m.nombre, m.email, m.telefono, m.fecha_inscripcion,
                m.activo, m.rol_id, m.password_hash, m.permisos_especiales,
                m.fecha_nacimiento, m.genero, m.direccion, m.tipo_membresia,
                m.fecha_vencimiento_membresia, m.especialidad, m.horario_trabajo,
                m.certificaciones, m.fecha_creacion, m.fecha_actualizacion,
                r.nombre as rol_nombre 
            FROM miembros m
            LEFT JOIN roles r ON m.rol_id = r.id
        """
        cursor.execute(query)
        miembros = cursor.fetchall()
        
        # Procesar las condiciones médicas para cada miembro
        for miembro in miembros:
            if miembro.get('condiciones_medicas'):
                try:
                    # Intentar convertir el string JSON a lista
                    if isinstance(miembro['condiciones_medicas'], str):
                        miembro['condiciones_medicas'] = json.loads(miembro['condiciones_medicas'])
                except (json.JSONDecodeError, TypeError):
                    # Si hay un error al decodificar, dejar como está
                    pass
                    
        return jsonify(miembros)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Ruta para crear un nuevo miembro

# Ruta para actualizar un miembro existente
from flask import json

@app.route('/api/miembros/<int:miembro_id>', methods=['PUT'])
@token_required
def update_miembro(current_user, miembro_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)

        # Construir la consulta de actualización
        query = '''
            UPDATE miembros SET
                nombre=%s,
                email=%s,
                telefono=%s,
                fecha_inscripcion=%s,
                activo=%s,
                rol_id=%s,
                fecha_nacimiento=%s,
                genero=%s,
                direccion=%s,
                tipo_membresia=%s,
                fecha_vencimiento_membresia=%s,
                condiciones_medicas=%s,
                observaciones=%s
            WHERE id=%s
        '''
        condiciones_medicas = data.get('condiciones_medicas')
        if condiciones_medicas is not None and not isinstance(condiciones_medicas, str):
            condiciones_medicas = json.dumps(condiciones_medicas, ensure_ascii=False)

        cursor.execute(query, (
            data.get('nombre'),
            data.get('email'),
            data.get('telefono'),
            data.get('fecha_inscripcion'),
            data.get('activo', True),
            data.get('rol_id', 3),
            data.get('fecha_nacimiento'),
            data.get('genero'),
            data.get('direccion'),
            data.get('tipo_membresia'),
            data.get('fecha_vencimiento_membresia'),
            condiciones_medicas,
            data.get('observaciones'),
            miembro_id
        ))
        connection.commit()
        return jsonify({'message': 'Miembro actualizado correctamente'}), 200
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()
@app.route('/api/miembros', methods=['POST'])
@token_required
def create_miembro(current_user):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        # Validar campos requeridos
        required = ['nombre', 'email', 'password']
        for field in required:
            if field not in data:
                return jsonify({"error": f"Falta el campo: {field}"}), 400

        # Validar formato de email
        if '@' not in data['email'] or '.' not in data['email'].split('@')[-1]:
            return jsonify({"error": "Formato de correo electrónico inválido"}), 400

        # Validar longitud de contraseña
        if len(data['password']) < 6:
            return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

        # Conectar a la base de datos
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Error de conexión a la base de datos"}), 500

        cursor = conn.cursor(dictionary=True)

        # Verificar si el email ya existe
        cursor.execute("SELECT id FROM miembros WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({"error": "El correo ya está registrado"}), 400

        # Hashear la contraseña
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

        # Validar fecha de vencimiento si está presente
        fecha_vencimiento = data.get('fecha_vencimiento_membresia')
        if fecha_vencimiento:
            try:
                # Validar formato de fecha
                datetime.strptime(fecha_vencimiento, '%Y-%m-%d')
                # Convertir a None si está vacío
                if not fecha_vencimiento.strip():
                    fecha_vencimiento = None
            except (ValueError, AttributeError):
                return jsonify({"error": "Formato de fecha_vencimiento_membresia inválido. Use YYYY-MM-DD."}), 400

        # Validar el rol_id
        rol_id = data.get('rol_id', 3)  # Por defecto cliente (ID 3)
        if rol_id not in [1, 2, 3]:
            return jsonify({"error": "ID de rol no válido. Debe ser 1 (admin), 2 (entrenador) o 3 (cliente)"}), 400

        # Validar especialidad para entrenadores
        especialidad = None
        if rol_id == 2:  # Si es entrenador
            especialidad = data.get('especialidad')
            if not especialidad or not str(especialidad).strip():
                return jsonify({"error": "La especialidad es requerida para entrenadores"}), 400
            especialidad = especialidad.strip()

        # Insertar el nuevo miembro
        query = """
            INSERT INTO miembros (
                nombre, email, password_hash, telefono,
                fecha_inscripcion, activo, rol_id, fecha_vencimiento_membresia,
                especialidad,tipo_membresia
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        valores = (
            data['nombre'].strip(),
            data['email'].strip().lower(),
            password_hash,
            data.get('telefono', '').strip(),
            datetime.now().strftime('%Y-%m-%d'),
            True,
            rol_id,
            data.get('fecha_vencimiento_membresia', None) or None,
            especialidad,
            data.get('tipo_membresia', 'mensual')   
        )

        cursor.execute(query, valores)
        conn.commit()
        miembro_id = cursor.lastrowid

        # Obtener los datos del miembro recién creado
        cursor.execute("""
            SELECT id, nombre, email, telefono, fecha_inscripcion, 
                   activo, rol_id, fecha_nacimiento, genero, 
                   direccion, tipo_membresia, fecha_vencimiento_membresia,
                   especialidad
            FROM miembros 
            WHERE id = %s
        """, (miembro_id,))
        
        nuevo_miembro = cursor.fetchone()

        return jsonify({
            "message": "Miembro registrado exitosamente",
            "miembro": nuevo_miembro
        }), 201

    except Exception as e:
        if 'conn' in locals() and conn and conn.is_connected():
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()

# Ruta para eliminar un miembro
@app.route('/api/miembros/<int:miembro_id>', methods=['DELETE'])
@token_required
def delete_miembro(current_user, miembro_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Verificar si el miembro existe
        cursor.execute("SELECT id, nombre FROM miembros WHERE id = %s", (miembro_id,))
        miembro = cursor.fetchone()
        
        if not miembro:
            return jsonify({'error': 'Miembro no encontrado'}), 404
        
        # Eliminar el miembro
        cursor.execute("DELETE FROM miembros WHERE id = %s", (miembro_id,))
        connection.commit()
        
        return jsonify({
            'message': f'Miembro {miembro["nombre"]} eliminado exitosamente'
        }), 200
        
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals() and connection and connection.is_connected():
            connection.close()

# --- ENDPOINTS FACTURAS ---
@app.route('/api/facturas', methods=['GET'])
@token_required
def get_facturas(current_user):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute('''
            SELECT f.*, m.nombre as miembro_nombre, m.email as miembro_email
            FROM facturas f
            JOIN miembros m ON f.miembro_id = m.id
            ORDER BY f.fecha DESC, f.id DESC
        ''')
        facturas = cursor.fetchall()
        return jsonify(facturas)
    except Exception as e:
        print(f"Error al obtener facturas: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/facturas/<int:factura_id>', methods=['GET'])
@token_required
def get_factura(current_user, factura_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute('''
            SELECT f.*, m.nombre as miembro_nombre, m.email as miembro_email
            FROM facturas f
            JOIN miembros m ON f.miembro_id = m.id
            WHERE f.id = %s
        ''', (factura_id,))
        factura = cursor.fetchone()
        if not factura:
            return jsonify({'error': 'Factura no encontrada'}), 404
        return jsonify(factura)
    except Exception as e:
        print(f"Error al obtener factura: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/facturas', methods=['POST'])
@token_required
def crear_factura(current_user):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        query = '''
            INSERT INTO facturas (miembro_id, fecha, total, concepto, estado, metodo_pago, notas)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        '''
        cursor.execute(query, (
            data['miembro_id'],
            data['fecha'],
            data['total'],
            data['concepto'],
            data.get('estado', 'pendiente'),
            data.get('metodo_pago', None),
            data.get('notas', None)
        ))
        connection.commit()
        return jsonify({'message': 'Factura creada exitosamente', 'id': cursor.lastrowid}), 201
    except Exception as e:
        connection.rollback()
        print(f"Error al crear factura: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/facturas/<int:factura_id>', methods=['PUT'])
@token_required
def actualizar_factura(current_user, factura_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        query = '''
            UPDATE facturas SET miembro_id=%s, fecha=%s, total=%s, concepto=%s, estado=%s, metodo_pago=%s, notas=%s
            WHERE id=%s
        '''
        cursor.execute(query, (
            data['miembro_id'],
            data['fecha'],
            data['total'],
            data['concepto'],
            data.get('estado', 'pendiente'),
            data.get('metodo_pago', None),
            data.get('notas', None),
            factura_id
        ))
        connection.commit()
        return jsonify({'message': 'Factura actualizada exitosamente'})
    except Exception as e:
        connection.rollback()
        print(f"Error al actualizar factura: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/facturas/<int:factura_id>', methods=['DELETE'])
@token_required
def eliminar_factura(current_user, factura_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute('DELETE FROM facturas WHERE id=%s', (factura_id,))
        connection.commit()
        return jsonify({'message': 'Factura eliminada exitosamente'})
    except Exception as e:
        connection.rollback()
        print(f"Error al eliminar factura: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# --- RUTAS PARA INVENTARIO ---
@app.route('/api/inventario', methods=['GET'])
@token_required
def get_inventario(current_user):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor(dictionary=True)
        cursor.execute('SELECT * FROM inventario')
        inventario = cursor.fetchall()
        return jsonify(inventario)
    except Exception as e:
        print(f"Error al obtener inventario: {str(e)}")
        return jsonify({"error": "Error al obtener el inventario"}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/inventario', methods=['POST'])
@token_required
def create_inventario(current_user):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor()
        query = '''
            INSERT INTO inventario (nombre, tipo, cantidad, descripcion, fecha_registro, estado, proveedor, ubicacion, precio_unitario)
            VALUES (%s, %s, %s, %s, CURDATE(), %s, %s, %s, %s)
        '''
        cursor.execute(query, (
            data['nombre'],
            data['tipo'],
            data.get('cantidad', 0),
            data.get('descripcion', ''),
            data.get('estado', 'activo'),
            data.get('proveedor', ''),
            data.get('ubicacion', ''),
            data.get('precio_unitario', 0.0)
        ))
        connection.commit()
        return jsonify({"message": "Recurso agregado al inventario exitosamente"}), 201
    except Exception as e:
        connection.rollback()
        print(f"Error al crear inventario: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/inventario/<int:item_id>', methods=['PUT'])
@token_required
def update_inventario(current_user, item_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor()
        query = '''
            UPDATE inventario SET nombre=%s, tipo=%s, cantidad=%s, descripcion=%s, fecha_registro=%s, estado=%s, proveedor=%s, ubicacion=%s, precio_unitario=%s
            WHERE id=%s
        '''
        cursor.execute(query, (
            data['nombre'],
            data['tipo'],
            data.get('cantidad', 0),
            data.get('descripcion', ''),
            data.get('fecha_registro', None) or None,
            data.get('estado', 'activo'),
            data.get('proveedor', ''),
            data.get('ubicacion', ''),
            data.get('precio_unitario', 0.0),
            item_id
        ))
        connection.commit()
        return jsonify({"message": "Recurso de inventario actualizado exitosamente"})
    except Exception as e:
        connection.rollback()
        print(f"Error al actualizar inventario: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/inventario/<int:item_id>', methods=['DELETE'])
@token_required
def delete_inventario(current_user, item_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor()
        cursor.execute('DELETE FROM inventario WHERE id=%s', (item_id,))
        connection.commit()
        return jsonify({"message": "Recurso eliminado del inventario exitosamente"})
    except Exception as e:
        connection.rollback()
        print(f"Error al eliminar inventario: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/clases', methods=['GET'])
@token_required
def get_clases(current_user):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT c.*, m.nombre AS nombre_entrenador
            FROM clases c
            LEFT JOIN miembros m ON c.id_entrenador = m.id
        '''
        cursor.execute(query)
        clases = cursor.fetchall()
        return jsonify(clases)
    except Exception as e:
        print(f"Error al obtener clases: {str(e)}")
        return jsonify({"error": "Error al obtener las clases"}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/clases', methods=['POST'])
@token_required
def create_clase(current_user):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor()
        query = '''
            INSERT INTO clases (nombre, descripcion, horario, cupo_maximo, id_entrenador, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s, %s)
        '''
        cursor.execute(query, (
            data['nombre'],
            data.get('descripcion', ''),
            data.get('horario', ''),
            data.get('cupo_maximo', None),
            data.get('id_entrenador', None),
            data.get('fecha_creacion', None) or None
        ))
        connection.commit()
        return jsonify({"message": "Clase creada exitosamente"}), 201
    except Exception as e:
        connection.rollback()
        print(f"Error al crear clase: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/clases/<int:clase_id>', methods=['PUT'])
@token_required
def update_clase(current_user, clase_id):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor()
        query = '''
            UPDATE clases SET nombre=%s, descripcion=%s, horario=%s, cupo_maximo=%s, id_entrenador=%s
            WHERE id=%s
        '''
        cursor.execute(query, (
            data['nombre'],
            data.get('descripcion', ''),
            data.get('horario', ''),
            data.get('cupo_maximo', None),
            data.get('id_entrenador', None),
            clase_id
        ))
        connection.commit()
        return jsonify({"message": "Clase actualizada exitosamente"})
    except Exception as e:
        connection.rollback()
        print(f"Error al actualizar clase: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/miembros/activos', methods=['GET'])
@token_required
def get_miembros_activos(current_user):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT id, nombre, email, telefono, tipo_membresia, fecha_vencimiento_membresia
            FROM miembros
            WHERE activo = 1 AND (fecha_vencimiento_membresia IS NOT NULL AND fecha_vencimiento_membresia >= CURDATE())
        '''
        cursor.execute(query)
        miembros = cursor.fetchall()
        return jsonify({'miembros_activos': miembros}), 200
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/clases/<int:clase_id>', methods=['DELETE'])
@token_required
def delete_clase(current_user, clase_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        cursor = connection.cursor()
        query = 'DELETE FROM clases WHERE id=%s'
        cursor.execute(query, (clase_id,))
        connection.commit()
        return jsonify({"message": "Clase eliminada exitosamente"})
    except Exception as e:
        connection.rollback()
        print(f"Error al eliminar clase: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# --- ENDPOINTS DE RUTINAS ---

@app.route('/api/rutinas', methods=['GET'])
@token_required
def get_rutinas(current_user):
    """Obtener todas las rutinas"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT r.id, r.nombre, r.descripcion, r.duracion_semanas, r.nivel,
                   r.objetivo, r.id_entrenador, r.fecha_creacion,
                   COUNT(DISTINCT er.id) as total_ejercicios,
                   COUNT(DISTINCT rc.cliente_id) as total_clientes
            FROM rutinas r
            LEFT JOIN dias_rutina dr ON r.id = dr.rutina_id
            LEFT JOIN ejercicios_rutina er ON dr.id = er.dia_rutina_id
            LEFT JOIN rutinas_clientes rc ON r.id = rc.rutina_id AND rc.estado = 'activa'
            GROUP BY r.id
            ORDER BY r.fecha_creacion DESC
        '''
        cursor.execute(query)
        rutinas = cursor.fetchall()
        
        return jsonify({'rutinas': rutinas}), 200
        
    except Exception as e:
        print(f"Error al obtener rutinas: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/rutinas/<int:rutina_id>', methods=['GET'])
@token_required
def get_rutina_detalle(current_user, rutina_id):
    """Obtener detalles de una rutina específica"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Obtener información básica de la rutina
        query_rutina = '''
            SELECT r.*, COUNT(er.id) as total_ejercicios
            FROM rutinas r
            LEFT JOIN dias_rutina dr ON r.id = dr.rutina_id
            LEFT JOIN ejercicios_rutina er ON dr.id = er.dia_rutina_id
            WHERE r.id = %s
            GROUP BY r.id
        '''
        cursor.execute(query_rutina, (rutina_id,))
        rutina = cursor.fetchone()
        
        if not rutina:
            return jsonify({'error': 'Rutina no encontrada'}), 404
        
        # Obtener los días de la rutina
        query_dias = '''
            SELECT dr.*, COUNT(er.id) as ejercicios_por_dia
            FROM dias_rutina dr
            LEFT JOIN ejercicios_rutina er ON dr.id = er.dia_rutina_id
            WHERE dr.rutina_id = %s
            GROUP BY dr.id
            ORDER BY dr.orden
        '''
        cursor.execute(query_dias, (rutina_id,))
        dias = cursor.fetchall()
        
        # Obtener los ejercicios de cada día
        for dia in dias:
            query_ejercicios = '''
                SELECT er.*, e.nombre as ejercicio_nombre, e.descripcion as ejercicio_descripcion,
                       e.tipo_ejercicio, e.imagen_url,
                       ce.nombre as categoria_nombre
                FROM ejercicios_rutina er
                JOIN ejercicios e ON er.ejercicio_id = e.id
                JOIN categorias_ejercicios ce ON e.categoria_id = ce.id
                WHERE er.dia_rutina_id = %s
                ORDER BY er.orden
            '''
            cursor.execute(query_ejercicios, (dia['id'],))
            dia['ejercicios'] = cursor.fetchall()
        
        rutina['dias'] = dias
        
        # Obtener los clientes asignados a esta rutina
        query_clientes = '''
            SELECT c.id, c.nombre, c.email, c.telefono,
                   rc.fecha_inicio, rc.fecha_fin, rc.estado, rc.notas
            FROM rutinas_clientes rc
            JOIN miembros c ON rc.cliente_id = c.id
            WHERE rc.rutina_id = %s AND rc.estado = 'activa'
            ORDER BY c.nombre
        '''
        cursor.execute(query_clientes, (rutina_id,))
        clientes = cursor.fetchall()
        
        rutina['clientes'] = clientes
        
        return jsonify({'rutina': rutina}), 200
        
    except Exception as e:
        print(f"Error al obtener rutina: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/rutinas', methods=['POST'])
@token_required
def create_rutina(current_user):
    """Crear una nueva rutina"""
    try:
        data = request.get_json()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor()
        
        # Insertar la rutina
        query_rutina = '''
            INSERT INTO rutinas (nombre, descripcion, duracion_semanas, nivel_dificultad, 
                                objetivo, creado_por, fecha_creacion, activo)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), 1)
        '''
        cursor.execute(query_rutina, (
            data.get('nombre'),
            data.get('descripcion'),
            data.get('duracion_semanas', 4),
            data.get('nivel_dificultad', 'Principiante'),
            data.get('objetivo', 'General'),
            current_user
        ))
        
        rutina_id = cursor.lastrowid
        
        # Insertar días de la rutina
        dias = data.get('dias', [])
        for dia_data in dias:
            query_dia = '''
                INSERT INTO dias_rutina (rutina_id, nombre_dia, descripcion, orden)
                VALUES (%s, %s, %s, %s)
            '''
            cursor.execute(query_dia, (
                rutina_id,
                dia_data.get('nombre_dia'),
                dia_data.get('descripcion', ''),
                dia_data.get('orden', 1)
            ))
            
            dia_id = cursor.lastrowid
            
            # Insertar ejercicios del día
            ejercicios = dia_data.get('ejercicios', [])
            for ejercicio_data in ejercicios:
                query_ejercicio = '''
                    INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                                  series, repeticiones, peso, tiempo_descanso, orden)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                '''
                cursor.execute(query_ejercicio, (
                    rutina_id,
                    dia_id,
                    ejercicio_data.get('ejercicio_id'),
                    ejercicio_data.get('series', 3),
                    ejercicio_data.get('repeticiones', 10),
                    ejercicio_data.get('peso', 0),
                    ejercicio_data.get('tiempo_descanso', 60),
                    ejercicio_data.get('orden', 1)
                ))
        
        connection.commit()
        return jsonify({'message': 'Rutina creada exitosamente', 'rutina_id': rutina_id}), 201
        
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        print(f"Error al crear rutina: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/rutinas/<int:rutina_id>', methods=['PUT'])
@token_required
def update_rutina(current_user, rutina_id):
    """Actualizar una rutina existente"""
    try:
        data = request.get_json()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor()
        
        # Actualizar la rutina
        query_rutina = '''
            UPDATE rutinas 
            SET nombre = %s, descripcion = %s, duracion_semanas = %s, 
                nivel_dificultad = %s, objetivo = %s
            WHERE id = %s
        '''
        cursor.execute(query_rutina, (
            data.get('nombre'),
            data.get('descripcion'),
            data.get('duracion_semanas', 4),
            data.get('nivel_dificultad', 'Principiante'),
            data.get('objetivo', 'General'),
            rutina_id
        ))
        
        connection.commit()
        return jsonify({'message': 'Rutina actualizada exitosamente'}), 200
        
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        print(f"Error al actualizar rutina: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/rutinas/<int:rutina_id>', methods=['DELETE'])
@token_required
def delete_rutina(current_user, rutina_id):
    """Eliminar una rutina (marcar como inactiva)"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor()
        query = 'UPDATE rutinas SET activo = 0 WHERE id = %s'
        cursor.execute(query, (rutina_id,))
        connection.commit()
        
        return jsonify({'message': 'Rutina eliminada exitosamente'}), 200
        
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        print(f"Error al eliminar rutina: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# --- ENDPOINTS DE CATEGORÍAS Y EJERCICIOS ---

@app.route('/api/categorias-ejercicios', methods=['GET'])
@token_required
def get_categorias_ejercicios(current_user):
    """Obtener todas las categorías de ejercicios"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        query = 'SELECT * FROM categorias_ejercicios ORDER BY nombre'
        cursor.execute(query)
        categorias = cursor.fetchall()
        
        return jsonify({'categorias': categorias}), 200
        
    except Exception as e:
        print(f"Error al obtener categorías: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/ejercicios', methods=['GET'])
@token_required
def get_ejercicios(current_user):
    """Obtener todos los ejercicios"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT e.*, ce.nombre as categoria_nombre
            FROM ejercicios e
            JOIN categorias_ejercicios ce ON e.categoria_id = ce.id
            ORDER BY e.nombre
        '''
        cursor.execute(query)
        ejercicios = cursor.fetchall()
        
        return jsonify({'ejercicios': ejercicios}), 200
        
    except Exception as e:
        print(f"Error al obtener ejercicios: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/ejercicios/categoria/<int:categoria_id>', methods=['GET'])
@token_required
def get_ejercicios_por_categoria(current_user, categoria_id):
    """Obtener ejercicios por categoría"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        query = '''
            SELECT e.*, ce.nombre as categoria_nombre
            FROM ejercicios e
            JOIN categorias_ejercicios ce ON e.categoria_id = ce.id
            WHERE e.categoria_id = %s
            ORDER BY e.nombre
        '''
        cursor.execute(query, (categoria_id,))
        ejercicios = cursor.fetchall()
        
        return jsonify({'ejercicios': ejercicios}), 200
        
    except Exception as e:
        print(f"Error al obtener ejercicios por categoría: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# Ruta para servir el archivo index.html
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/rutinas/<int:rutina_id>/asignar', methods=['POST'])
@token_required
def asignar_rutina(current_user, rutina_id):
    """Asignar una rutina a un cliente"""
    try:
        data = request.get_json()
        cliente_id = data.get('cliente_id')
        fecha_inicio = data.get('fecha_inicio')
        notas = data.get('notas', '')
        
        if not cliente_id or not fecha_inicio:
            return jsonify({'error': 'cliente_id y fecha_inicio son requeridos'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor()
        
        # Verificar que la rutina existe
        query_rutina = 'SELECT id FROM rutinas WHERE id = %s'
        cursor.execute(query_rutina, (rutina_id,))
        rutina = cursor.fetchone()
        
        if not rutina:
            return jsonify({'error': 'Rutina no encontrada'}), 404
        
        # Obtener el ID del entrenador a partir del email
        query_entrenador = 'SELECT id FROM miembros WHERE email = %s'
        cursor.execute(query_entrenador, (current_user,))
        entrenador = cursor.fetchone()
        
        if not entrenador:
            return jsonify({'error': 'Entrenador no encontrado'}), 404
        
        entrenador_id = entrenador[0]  # Acceder por índice, no por clave
        
        # Verificar que el cliente existe
        query_cliente = 'SELECT id FROM miembros WHERE id = %s'
        cursor.execute(query_cliente, (cliente_id,))
        cliente = cursor.fetchone()
        
        if not cliente:
            return jsonify({'error': 'Cliente no encontrado'}), 404
        
        # Verificar si ya existe una asignación activa
        query_existente = '''
            SELECT rc.id, m.nombre as cliente_nombre 
            FROM rutinas_clientes rc
            JOIN miembros m ON rc.cliente_id = m.id
            WHERE rc.rutina_id = %s AND rc.cliente_id = %s AND rc.estado = 'activa'
        '''
        cursor.execute(query_existente, (rutina_id, cliente_id))
        asignacion_existente = cursor.fetchone()
        
        if asignacion_existente:
            return jsonify({
                'error': f'El cliente {asignacion_existente[1]} ya tiene esta rutina asignada activamente'
            }), 400
        
        # Insertar la nueva asignación
        query_asignar = '''
            INSERT INTO rutinas_clientes (rutina_id, cliente_id, entrenador_id, fecha_inicio, notas, estado)
            VALUES (%s, %s, %s, %s, %s, 'activa')
        '''
        cursor.execute(query_asignar, (rutina_id, cliente_id, entrenador_id, fecha_inicio, notas))
        
        connection.commit()
        
        return jsonify({
            'message': 'Rutina asignada exitosamente',
            'asignacion_id': cursor.lastrowid
        }), 201
        
    except Exception as e:
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
        print(f"Error al asignar rutina: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/rutinas/<int:rutina_id>/clientes-asignados', methods=['GET'])
@token_required
def get_clientes_asignados(current_user, rutina_id):
    """Obtener los clientes que ya tienen esta rutina asignada"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Verificar que la rutina existe
        query_rutina = 'SELECT id, nombre FROM rutinas WHERE id = %s'
        cursor.execute(query_rutina, (rutina_id,))
        rutina = cursor.fetchone()
        
        if not rutina:
            return jsonify({'error': 'Rutina no encontrada'}), 404
        
        # Obtener clientes asignados activamente
        query_clientes = '''
            SELECT m.id, m.nombre, m.email, rc.fecha_inicio, rc.estado
            FROM rutinas_clientes rc
            JOIN miembros m ON rc.cliente_id = m.id
            WHERE rc.rutina_id = %s AND rc.estado = 'activa'
            ORDER BY m.nombre
        '''
        cursor.execute(query_clientes, (rutina_id,))
        clientes_asignados = cursor.fetchall()
        
        return jsonify({
            'rutina': rutina,
            'clientes_asignados': clientes_asignados
        }), 200
        
    except Exception as e:
        print(f"Error al obtener clientes asignados: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# --- ENDPOINT DE INGRESOS MEMBRESÍAS ---

# ===========================================
# ENDPOINTS DE REPORTES
# ===========================================

@app.route('/api/reportes/asistencia', methods=['GET'])
@token_required
def reporte_asistencia(current_user):
    """Obtener reporte de asistencia por rango de tiempo"""
    try:
        # Obtener parámetros de la consulta
        rango = request.args.get('rango', 'semana')  # dia, semana, mes, personalizado
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Calcular fechas según el rango
        if rango == 'dia':
            fecha_inicio = datetime.now().strftime('%Y-%m-%d')
            fecha_fin = datetime.now().strftime('%Y-%m-%d')
        elif rango == 'semana':
            fecha_inicio = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            fecha_fin = datetime.now().strftime('%Y-%m-%d')
        elif rango == 'mes':
            fecha_inicio = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            fecha_fin = datetime.now().strftime('%Y-%m-%d')
        # Para personalizado, usar las fechas proporcionadas
        
        # Obtener el ID del entrenador
        query_entrenador = 'SELECT id FROM miembros WHERE email = %s'
        cursor.execute(query_entrenador, (current_user,))
        entrenador = cursor.fetchone()
        
        if not entrenador:
            return jsonify({'error': 'Entrenador no encontrado'}), 404
        
        entrenador_id = entrenador['id']
        
        # Consulta para obtener asistencias por día
        query_asistencia = '''
            SELECT 
                DATE(a.fecha_hora_entrada) as fecha,
                COUNT(*) as total_asistencias,
                COUNT(DISTINCT a.miembro_id) as clientes_unicos
            FROM asistencias a
            JOIN miembros m ON a.miembro_id = m.id
            WHERE DATE(a.fecha_hora_entrada) BETWEEN %s AND %s
            AND m.rol_id = 3  -- Solo clientes
            GROUP BY DATE(a.fecha_hora_entrada)
            ORDER BY fecha
        '''
        
        cursor.execute(query_asistencia, (fecha_inicio, fecha_fin))
        asistencias_por_dia = cursor.fetchall()
        
        # Consulta para obtener estadísticas generales
        query_stats = '''
            SELECT 
                COUNT(*) as total_asistencias,
                COUNT(DISTINCT a.miembro_id) as clientes_unicos,
                AVG(TIMESTAMPDIFF(MINUTE, a.fecha_hora_entrada, COALESCE(a.fecha_hora_salida, NOW()))) as tiempo_promedio
            FROM asistencias a
            JOIN miembros m ON a.miembro_id = m.id
            WHERE DATE(a.fecha_hora_entrada) BETWEEN %s AND %s
            AND m.rol_id = 3
        '''
        
        cursor.execute(query_stats, (fecha_inicio, fecha_fin))
        estadisticas = cursor.fetchone()
        
        # Formatear datos para el gráfico
        datos_grafico = []
        for asistencia in asistencias_por_dia:
            # Verificar si fecha es string o datetime
            if isinstance(asistencia['fecha'], str):
                fecha = datetime.strptime(asistencia['fecha'], '%Y-%m-%d')
            else:
                fecha = asistencia['fecha']
            
            datos_grafico.append({
                'fecha': fecha.strftime('%Y-%m-%d'),
                'dia': fecha.strftime('%a')[:3],  # Lun, Mar, etc.
                'asistencias': asistencia['total_asistencias'],
                'clientes_unicos': asistencia['clientes_unicos']
            })
        
        return jsonify({
            'datos_grafico': datos_grafico,
            'estadisticas': estadisticas,
            'rango': rango,
            'fecha_inicio': fecha_inicio,
            'fecha_fin': fecha_fin
        }), 200
        
    except Exception as e:
        print(f"Error en reporte de asistencia: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/reportes/rutinas', methods=['GET'])
@token_required
def reporte_rutinas(current_user):
    """Obtener reporte de rutinas y asignaciones"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Obtener el ID del entrenador
        query_entrenador = 'SELECT id FROM miembros WHERE email = %s'
        cursor.execute(query_entrenador, (current_user,))
        entrenador = cursor.fetchone()
        
        if not entrenador:
            return jsonify({'error': 'Entrenador no encontrado'}), 404
        
        entrenador_id = entrenador['id']
        
        # Estadísticas de rutinas por nivel
        query_nivel = '''
            SELECT 
                r.nivel,
                COUNT(*) as total_rutinas,
                COUNT(rc.id) as rutinas_asignadas
            FROM rutinas r
            LEFT JOIN rutinas_clientes rc ON r.id = rc.rutina_id AND rc.estado = 'activa'
            WHERE r.id_entrenador = %s
            GROUP BY r.nivel
        '''
        
        cursor.execute(query_nivel, (entrenador_id,))
        rutinas_por_nivel = cursor.fetchall()
        
        # Estadísticas de rutinas por objetivo
        query_objetivo = '''
            SELECT 
                r.objetivo,
                COUNT(*) as total_rutinas,
                COUNT(rc.id) as rutinas_asignadas
            FROM rutinas r
            LEFT JOIN rutinas_clientes rc ON r.id = rc.rutina_id AND rc.estado = 'activa'
            WHERE r.id_entrenador = %s
            GROUP BY r.objetivo
        '''
        
        cursor.execute(query_objetivo, (entrenador_id,))
        rutinas_por_objetivo = cursor.fetchall()
        
        # Top 5 rutinas más asignadas
        query_top_rutinas = '''
            SELECT 
                r.nombre,
                r.nivel,
                r.objetivo,
                COUNT(rc.id) as total_asignaciones
            FROM rutinas r
            LEFT JOIN rutinas_clientes rc ON r.id = rc.rutina_id AND rc.estado = 'activa'
            WHERE r.id_entrenador = %s
            GROUP BY r.id, r.nombre, r.nivel, r.objetivo
            ORDER BY total_asignaciones DESC
            LIMIT 5
        '''
        
        cursor.execute(query_top_rutinas, (entrenador_id,))
        top_rutinas = cursor.fetchall()
        
        # Estadísticas generales
        query_stats = '''
            SELECT 
                COUNT(*) as total_rutinas,
                COUNT(rc.id) as total_asignaciones,
                COUNT(DISTINCT rc.cliente_id) as clientes_activos
            FROM rutinas r
            LEFT JOIN rutinas_clientes rc ON r.id = rc.rutina_id AND rc.estado = 'activa'
            WHERE r.id_entrenador = %s
        '''
        
        cursor.execute(query_stats, (entrenador_id,))
        estadisticas = cursor.fetchone()
        
        return jsonify({
            'rutinas_por_nivel': rutinas_por_nivel,
            'rutinas_por_objetivo': rutinas_por_objetivo,
            'top_rutinas': top_rutinas,
            'estadisticas': estadisticas
        }), 200
        
    except Exception as e:
        print(f"Error en reporte de rutinas: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/reportes/clientes', methods=['GET'])
@token_required
def reporte_clientes(current_user):
    """Obtener reporte de clientes y su progreso"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Obtener el ID del entrenador
        query_entrenador = 'SELECT id FROM miembros WHERE email = %s'
        cursor.execute(query_entrenador, (current_user,))
        entrenador = cursor.fetchone()
        
        if not entrenador:
            return jsonify({'error': 'Entrenador no encontrado'}), 404
        
        entrenador_id = entrenador['id']
        
        # Estadísticas de clientes por estado de membresía
        query_estado = '''
            SELECT 
                CASE 
                    WHEN m.activo = 1 THEN 'Activos'
                    ELSE 'Inactivos'
                END as estado,
                COUNT(*) as total
            FROM miembros m
            WHERE m.rol_id = 3  -- Solo clientes
            GROUP BY m.activo
        '''
        
        cursor.execute(query_estado)
        clientes_por_estado = cursor.fetchall()
        
        # Clientes con rutinas asignadas
        query_con_rutinas = '''
            SELECT 
                m.nombre,
                m.email,
                COUNT(rc.id) as rutinas_asignadas,
                MAX(rc.fecha_inicio) as ultima_asignacion
            FROM miembros m
            LEFT JOIN rutinas_clientes rc ON m.id = rc.cliente_id AND rc.estado = 'activa'
            WHERE m.rol_id = 3
            GROUP BY m.id, m.nombre, m.email
            HAVING rutinas_asignadas > 0
            ORDER BY rutinas_asignadas DESC
        '''
        
        cursor.execute(query_con_rutinas)
        clientes_con_rutinas = cursor.fetchall()
        
        # Nuevos clientes este mes
        query_nuevos = '''
            SELECT COUNT(*) as nuevos_clientes
            FROM miembros m
            WHERE m.rol_id = 3 
            AND MONTH(m.fecha_inscripcion) = MONTH(CURDATE())
            AND YEAR(m.fecha_inscripcion) = YEAR(CURDATE())
        '''
        
        cursor.execute(query_nuevos)
        nuevos_clientes = cursor.fetchone()
        
        # Estadísticas generales - Un cliente se considera activo solo si:
        # 1. Está marcado como activo (activo = 1) Y
        # 2. No tiene fecha de vencimiento O tiene una fecha de vencimiento futura
        query_stats = '''
            SELECT 
                COUNT(*) as total_clientes,
                COUNT(CASE 
                    WHEN m.activo = 1 AND 
                         (m.fecha_vencimiento_membresia IS NULL OR 
                          m.fecha_vencimiento_membresia >= CURDATE()) 
                    THEN 1 
                END) as clientes_activos,
                COUNT(CASE 
                    WHEN m.activo = 0 OR 
                         (m.fecha_vencimiento_membresia IS NOT NULL AND 
                          m.fecha_vencimiento_membresia < CURDATE())
                    THEN 1 
                END) as clientes_inactivos
            FROM miembros m
            WHERE m.rol_id = 3  -- Solo clientes
        '''
        
        cursor.execute(query_stats)
        estadisticas = cursor.fetchone()
        
        return jsonify({
            'clientes_por_estado': clientes_por_estado,
            'clientes_con_rutinas': clientes_con_rutinas,
            'nuevos_clientes': nuevos_clientes,
            'estadisticas': estadisticas
        }), 200
        
    except Exception as e:
        print(f"Error en reporte de clientes: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/reportes/progreso', methods=['GET'])
@token_required
def reporte_progreso(current_user):
    """Obtener reporte de progreso de clientes"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Obtener el ID del entrenador
        query_entrenador = 'SELECT id FROM miembros WHERE email = %s'
        cursor.execute(query_entrenador, (current_user,))
        entrenador = cursor.fetchone()
        
        if not entrenador:
            return jsonify({'error': 'Entrenador no encontrado'}), 404
        
        entrenador_id = entrenador['id']
        
        # Progreso por cliente (últimos 30 días)
        query_progreso = '''
            SELECT 
                m.nombre as cliente,
                COUNT(pe.id) as sesiones_completadas,
                AVG(pe.dificultad_percibida) as dificultad_promedio,
                MAX(pe.fecha_ejecucion) as ultima_sesion
            FROM miembros m
            JOIN rutinas_clientes rc ON m.id = rc.cliente_id
            LEFT JOIN progreso_ejercicios pe ON rc.id = pe.rutina_cliente_id
            WHERE rc.entrenador_id = %s
            AND rc.estado = 'activa'
            AND pe.fecha_ejecucion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY m.id, m.nombre
            ORDER BY sesiones_completadas DESC
        '''
        
        cursor.execute(query_progreso, (entrenador_id,))
        progreso_clientes = cursor.fetchall()
        
        # Marcas personales recientes
        query_marcas = '''
            SELECT 
                m.nombre as cliente,
                e.nombre as ejercicio,
                mp.peso_maximo,
                mp.repeticiones_maximas,
                mp.fecha_establecida
            FROM marcas_personales mp
            JOIN miembros m ON mp.cliente_id = m.id
            JOIN ejercicios e ON mp.ejercicio_id = e.id
            WHERE mp.fecha_establecida >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY mp.fecha_establecida DESC
            LIMIT 10
        '''
        
        cursor.execute(query_marcas)
        marcas_recientes = cursor.fetchall()
        
        # Estadísticas de progreso
        query_stats = '''
            SELECT 
                COUNT(DISTINCT pe.rutina_cliente_id) as clientes_con_progreso,
                AVG(pe.dificultad_percibida) as dificultad_promedio,
                COUNT(pe.id) as total_sesiones
            FROM progreso_ejercicios pe
            JOIN rutinas_clientes rc ON pe.rutina_cliente_id = rc.id
            WHERE rc.entrenador_id = %s
            AND pe.fecha_ejecucion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        '''
        
        cursor.execute(query_stats, (entrenador_id,))
        estadisticas_progreso = cursor.fetchone()
        
        return jsonify({
            'progreso_clientes': progreso_clientes,
            'marcas_recientes': marcas_recientes,
            'estadisticas_progreso': estadisticas_progreso
        }), 200
        
    except Exception as e:
        print(f"Error en reporte de progreso: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# Ruta para servir archivos estáticos (CSS, JS, imágenes, etc.)
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del servidor"""
    return jsonify({
        "status": "ok",
        "message": "Servidor funcionando correctamente",
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }), 200

def actualizar_estado_miembros():
    """Actualiza el estado de los miembros basado en la fecha de vencimiento de su membresía"""
    try:
        connection = get_db_connection()
        if not connection:
            print("Error al conectar a la base de datos")
            return
            
        cursor = connection.cursor()
        
        # Actualizar a inactivos los miembros con membresía vencida
        query = """
        UPDATE miembros 
        SET activo = 0 
        WHERE activo = 1 
        AND rol_id = 3 
        AND fecha_vencimiento_membresia IS NOT NULL 
        AND fecha_vencimiento_membresia < CURDATE()
        """
        
        cursor.execute(query)
        updated = cursor.rowcount
        
        if updated > 0:
            print(f"Actualizados {updated} miembros a inactivos por membresía vencida")
            
        connection.commit()
        
    except Exception as e:
        print(f"Error al actualizar estado de miembros: {str(e)}")
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# Configurar tarea programada para ejecutarse diariamente
import threading
import time
from datetime import datetime, time as dtime

def programar_actualizacion():
    """Ejecuta la actualización diaria a la 1 AM"""
    while True:
        now = datetime.now()
        target_time = now.replace(hour=1, minute=0, second=0, microsecond=0)
        
        # Si ya pasó la hora de hoy, programar para mañana
        if now > target_time:
            target_time = target_time.replace(day=now.day + 1)
        
        # Calcular segundos hasta la próxima ejecución
        delta = (target_time - now).total_seconds()
        
        # Esperar hasta la hora programada
        time.sleep(delta)
        
        # Ejecutar la actualización
        print(f"[{datetime.now()}] Ejecutando actualización diaria de estados de membresía...")
        actualizar_estado_miembros()

# Iniciar el hilo de actualización en segundo plano
# Solo en producción, en desarrollo puede ser molesto
try:
    if os.environ.get('FLASK_ENV') == 'production':
        print("Iniciando hilo de actualización de membresías...")
        hilo_actualizacion = threading.Thread(target=programar_actualizacion, daemon=True)
        hilo_actualizacion.start()
except Exception as e:
    print(f"Error al iniciar el hilo de actualización: {str(e)}")

if __name__ == '__main__':
    # Ejecutar una vez al iniciar
    print("Verificando estados de membresía...")
    actualizar_estado_miembros()
    
    print("Iniciando servidor en http://127.0.0.1:5000")
    print("Rutas disponibles:")
    print("  - GET  / (Página principal)")
    print("  - GET  /api/health (Verificar estado del servidor)")
    print("  - POST /api/auth/login")
    print("  - GET  /api/auth/me")
    print("  - GET  /api/miembros")
    print("  - POST /api/miembros")
    print("  - GET  /api/facturas")
    print("  - POST /api/facturas")
    print("  - GET  /api/test")
    print("  - GET  /api/miembros")
    print("  - POST /api/miembros")
    print("  - GET  /api/clases")
    print("  - POST /api/clases")
    print("  - PUT  /api/clases/<id>")
    print("  - DELETE /api/clases/<id>")
    app.run(host='0.0.0.0', port=5000, debug=True)
    