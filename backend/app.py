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

# Configuración de CORS
cors = CORS(
    app,
    resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": app.config['CORS_METHODS'],
            "allow_headers": app.config['CORS_ALLOW_HEADERS'],
            "expose_headers": app.config['CORS_EXPOSE_HEADERS'],
            "supports_credentials": app.config['CORS_SUPPORTS_CREDENTIALS']
        }
    }
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
def get_miembros():
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
@app.route('/api/miembros', methods=['POST'])
def create_miembro():
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
                especialidad,tipo_membresia,
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

# Ruta para servir el archivo index.html
@app.route('/')
def index():
    return render_template('index.html')

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

if __name__ == '__main__':
    print("Iniciando servidor en http:/192.168.10.53:5000")
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
    