from flask import Flask, jsonify, request, make_response
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
# Configuración de CORS para desarrollo
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3307", "http://192.168.11.136:3307"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# Configuración para manejar las solicitudes OPTIONS
@app.after_request
def after_request(response):
    allowed_origins = ['http://localhost:3307', 'http://192.168.11.136:3307']
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response
# Configuración de JWT
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu_clave_secreta_muy_segura')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

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
        print("\n--- token_required iniciado ---")
        token = None
        
        # Obtener el token del header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            print(f"Authorization header: {auth_header}")
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                print(f"Token extraído: {token[:10]}...")  # Solo mostramos parte del token por seguridad
            else:
                print("Formato de Authorization header inválido")
        
        if not token:
            print("Error: No se proporcionó token")
            return jsonify({'message': 'Token no proporcionado'}), 401
            
        try:
            print("Intentando decodificar el token...")
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            print(f"Token decodificado: {data}")
            current_user = data['email']
            print(f"Usuario extraído del token: {current_user}")
        except jwt.ExpiredSignatureError:
            print("Error: Token expirado")
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Error: Token inválido - {str(e)}")
            return jsonify({'message': 'Token inválido'}), 401
        except Exception as e:
            print(f"Error inesperado al decodificar token: {str(e)}")
            return jsonify({'message': 'Error al procesar el token'}), 500
            
        print("Token validado correctamente")
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
        """, (auth['email'],))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        # Verificación temporal de contraseña en texto plano
        print(f"Contraseña recibida: {auth['password']}")
        print(f"Contraseña almacenada: {user['password_hash']}")
        
        # Verificar si la contraseña coincide (comparación directa)
        if auth['password'] != user['password_hash']:
            print("Contraseña incorrecta")
            return jsonify({'error': 'Contraseña incorrecta'}), 401
            
        print("Inicio de sesión exitoso (modo texto plano)")
        
        # Generar token JWT
        token = jwt.encode({
            'email': user['email'],
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['SECRET_KEY'])
        
        # Eliminar datos sensibles
        user.pop('password_hash', None)
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'token': token,
            'user': user
        })
        
    except Error as e:
        print(f"Error en login: {e}")
        return jsonify({"error": str(e)}), 500
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
        
        # Crear respuesta en el formato que espera el frontend
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'nombre': user.get('nombre', ''),  # Usar get() para evitar KeyError
            'rol_nombre': user['rol_nombre'],
            'role': role_map.get(user['rol_nombre'].lower().strip(), 'client')
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
@app.route('/api/miembros', methods=['GET'])
def get_miembros():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Error al conectar a la base de datos"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Realizar JOIN con la tabla roles para obtener el nombre del rol
        query = """
            SELECT m.*, r.nombre as rol_nombre 
            FROM miembros m
            LEFT JOIN roles r ON m.rol_id = r.id
        """
        cursor.execute(query)
        miembros = cursor.fetchall()
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
    data = request.json
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Error al conectar a la base de datos"}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO miembros (nombre, email, telefono, fecha_inscripcion, rol_id, password_hash)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        # En una aplicación real, deberías hashear la contraseña aquí
        password_hash = data.get('password', '')  # Esto es solo para ejemplo
        
        cursor.execute(query, ( 
            data['nombre'],
            data['email'],
            data.get('telefono', ''),
            data.get('fecha_inscripcion', datetime.now().date()),
            data.get('rol_id', 4),  # Por defecto cliente
            password_hash
        ))
        
        connection.commit()
        return jsonify({"message": "Miembro creado exitosamente"}), 201
        
    except Error as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Rutas para el manejo de asistencias
@app.route('/api/asistencias', methods=['GET'])
@token_required
def get_asistencias(current_user):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Si es cliente, solo puede ver sus propias asistencias
        query = """
            SELECT a.*, m.nombre as miembro_nombre, m.email as miembro_email,
                   u.nombre as creado_por_nombre
            FROM asistencias a
            JOIN miembros m ON a.miembro_id = m.id
            LEFT JOIN miembros u ON a.creado_por = u.id
            WHERE DATE(a.fecha_hora_entrada) = CURDATE() AND (%s = %s OR %s IN (1, 2, 3))  # Solo admin, entrenador o recepcionista pueden ver todas
            ORDER BY a.fecha_hora_entrada DESC
        """
        
        # Si es admin/entrenador/recepcionista, ver todas las asistencias
        if current_user not in ['admin@gym.com', 'entrenador@gym.com', ]:
            

            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id FROM miembros WHERE email = %s", (current_user,))
            miembro = cursor.fetchone()
            if not miembro:
                return jsonify({"error": "Miembro no encontrado"}), 404
            id = miembro['id']
            cursor.execute(query, (id, id, 0))
        else:
            cursor.execute(query, (0, 0, 1))
            
        asistencias = cursor.fetchall()
        return jsonify(asistencias)
        
    except Exception as e:
        print(f"Error al obtener asistencias: {str(e)}")
        return jsonify({"error": "Error al obtener las asistencias"}), 500
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
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

@app.route('/api/reportes/asistencias', methods=['GET'])
@token_required
def reporte_asistencias(current_user):
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Error al conectar a la base de datos'}), 500
        cursor = connection.cursor(dictionary=True)

        # Asistencias por día
        query_dias = '''
            SELECT DATE(fecha_hora_entrada) as fecha, COUNT(*) as cantidad
            FROM asistencias
            WHERE fecha_hora_entrada BETWEEN %s AND %s
            GROUP BY DATE(fecha_hora_entrada)
            ORDER BY fecha
        '''
        cursor.execute(query_dias, (fecha_inicio, fecha_fin))
        asistenciasPorDia = cursor.fetchall()

        # Distribución por tipo
        query_tipo = '''
            SELECT tipo_asistencia, COUNT(*) as cantidad
            FROM asistencias
            WHERE fecha_hora_entrada BETWEEN %s AND %s
            GROUP BY tipo_asistencia
        '''
        cursor.execute(query_tipo, (fecha_inicio, fecha_fin))
        tiposAsistencia = {row['tipo_asistencia']: row['cantidad'] for row in cursor.fetchall()}

        return jsonify({
            'asistenciasPorDia': asistenciasPorDia,
            'tiposAsistencia': tiposAsistencia
        })
    except Exception as e:
        print(f"Error en reporte_asistencias: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/asistencias', methods=['POST'])
@token_required
def registrar_asistencia(current_user):
    try:
        data = request.json
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
            
        cursor = connection.cursor()
        
        # Obtener ID del usuario que registra la asistencia
        cursor.execute("SELECT id FROM miembros WHERE email = %s", (current_user,))
        creado_por = cursor.fetchone()
        
        query = """
            INSERT INTO asistencias 
            (miembro_id, fecha_hora_entrada, tipo_asistencia, notas, creado_por)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            data['miembro_id'],
            data.get('fecha_hora_entrada', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            data.get('tipo_asistencia', 'entrenamiento'),
            data.get('notas', ''),
            creado_por['id'] if creado_por else None
        ))
        
        connection.commit()
        return jsonify({"message": "Asistencia registrada exitosamente"}), 201
        
    except Exception as e:
        connection.rollback()
        print(f"Error al registrar asistencia: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/asistencias/<int:asistencia_id>/salida', methods=['PUT'])
@token_required
def registrar_salida(current_user, asistencia_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Error al conectar a la base de datos"}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Verificar que la asistencia existe y no tiene fecha de salida
        cursor.execute("""
            SELECT * FROM asistencias 
            WHERE id = %s AND fecha_hora_salida IS NULL
        """, (asistencia_id,))
        
        asistencia = cursor.fetchone()
        if not asistencia:
            return jsonify({"error": "Asistencia no encontrada o ya registrada la salida"}), 404
        
        # Actualizar la fecha de salida
        cursor.execute("""
            UPDATE asistencias 
            SET fecha_hora_salida = %s 
            WHERE id = %s
        """, (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), asistencia_id))
        
        connection.commit()
        return jsonify({"message": "Salida registrada exitosamente"})
        
    except Exception as e:
        connection.rollback()
        print(f"Error al registrar salida: {str(e)}")
        return jsonify({"error": str(e)}), 400
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()

# --- RUTAS PARA CLASES ---

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
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
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

if __name__ == '__main__':
    print("Iniciando servidor en http://192.168.11.136:5000")
    print("Rutas disponibles:")
    print("  - POST /api/auth/login")
    print("  - GET  /api/test")
    print("  - GET  /api/miembros")
    print("  - POST /api/miembros")
    print("  - GET  /api/asistencias")
    print("  - POST /api/asistencias")
    print("  - PUT  /api/asistencias/<id>/salida")
    print("  - GET  /api/clases")
    print("  - POST /api/clases")
    print("  - PUT  /api/clases/<id>")
    print("  - DELETE /api/clases/<id>")
    app.run(host='0.0.0.0', port=5000, debug=True)
    