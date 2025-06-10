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
        "origins": ["http://localhost:3000", "http://192.168.1.135:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# Configuración para manejar las solicitudes OPTIONS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://192.168.1.135:3000')
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

# Ruta para obtener todos los miembros (ejemplo)
@app.route('/api/miembros', methods=['GET'])
def get_miembros():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Error al conectar a la base de datos"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM miembros")
        miembros = cursor.fetchall()
        return jsonify(miembros)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Ruta para crear un nuevo miembro (ejemplo)
@app.route('/api/miembros', methods=['POST'])
def create_miembro():
    data = request.json
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Error al conectar a la base de datos"}), 500
    
    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO miembros (nombre, email, telefono, fecha_inscripcion)
            VALUES (%s, %s, %s, CURDATE())
        """
        cursor.execute(query, (data['nombre'], data['email'], data['telefono']))
        connection.commit()
        return jsonify({"message": "Miembro creado exitosamente", "id": cursor.lastrowid}), 201
    except Error as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    print("Iniciando servidor en http://192.168.1.135:5000")
    print("Rutas disponibles:")
    print("  - POST /api/auth/login")
    print("  - GET  /api/test")
    print("  - GET  /api/miembros")
    print("  - POST /api/miembros")
    app.run(host='192.168.1.135', port=5000, debug=True)
