import os
import bcrypt
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

# Cargar variables de entorno
load_dotenv()

def get_db_connection():
    try:
        print("Conectando a la base de datos...")
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD') or None,
            database=os.getenv('DB_NAME'),
            auth_plugin='mysql_native_password'
        )
        print("Conexión exitosa a la base de datos")
        return connection
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

def update_passwords():
    connection = get_db_connection()
    if not connection:
        print("No se pudo conectar a la base de datos")
        return

    try:
        cursor = connection.cursor(dictionary=True)
        
        # Obtener todos los usuarios
        cursor.execute("SELECT id, email, password_hash FROM miembros")
        users = cursor.fetchall()
        
        print(f"Se encontraron {len(users)} usuarios en la base de datos")
        
        updated_count = 0
        
        for user in users:
            password_hash = user['password_hash']
            
            # Si la contraseña ya está en formato bcrypt, saltar
            if password_hash and password_hash.startswith('$2b$'):
                print(f"Usuario {user['email']} ya tiene contraseña hasheada")
                continue
                
            # Si no hay contraseña, establecer una por defecto (el email sin el @)
            if not password_hash:
                default_password = user['email'].split('@')[0]
                password = default_password.encode('utf-8')
            else:
                password = password_hash.encode('utf-8')
            
            # Generar el hash bcrypt
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password, salt)
            
            # Actualizar el usuario
            update_cursor = connection.cursor()
            update_cursor.execute(
                "UPDATE miembros SET password_hash = %s WHERE id = %s",
                (hashed.decode('utf-8'), user['id'])
            )
            connection.commit()
            update_cursor.close()
            
            updated_count += 1
            print(f"Actualizado usuario {user['email']} con nueva contraseña")
        
        print(f"\nProceso completado. Se actualizaron {updated_count} usuarios.")
        
    except Error as e:
        print(f"Error al actualizar contraseñas: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("Conexión cerrada")

if __name__ == '__main__':
    print("=== Actualizador de contraseñas ===")
    print("Este script actualizará las contraseñas de los usuarios a formato bcrypt")
    print("Las contraseñas existentes se reemplazarán con versiones hasheadas")
    print("ADVERTENCIA: Asegúrese de hacer una copia de seguridad de la base de datos antes de continuar")
    
    confirm = input("¿Desea continuar? (s/n): ")
    if confirm.lower() == 's':
        update_passwords()
    else:
        print("Operación cancelada")

def verificar_usuario(email, password_ingresada):
    connection = get_db_connection()
    if not connection:
        print("No se pudo conectar a la base de datos")
        return False

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT password_hash FROM miembros WHERE email = %s", (email,))
        user = cursor.fetchone()
        if user is None:
            print("Usuario no encontrado")
            return False

        password_hash = user['password_hash']
        if password_hash is None:
            print("Usuario sin contraseña establecida")
            return False

        # bcrypt espera bytes, así que convertimos el hash a bytes también
        password_hash_bytes = password_hash.encode('utf-8')
        password_bytes = password_ingresada.encode('utf-8')

        if bcrypt.checkpw(password_bytes, password_hash_bytes):
            print("¡Usuario autenticado!")
            return True
        else:
            print("Contraseña incorrecta")
            return False
    except Error as e:
        print(f"Error durante la verificación: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
    