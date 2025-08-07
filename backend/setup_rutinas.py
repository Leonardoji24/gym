import mysql.connector
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

def setup_rutinas():
    try:
        # Conectar a la base de datos
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cursor = connection.cursor()
        
        print("Conectado a la base de datos exitosamente")
        
        # Leer el archivo SQL
        with open('init_db.sql', 'r', encoding='utf-8') as file:
            sql_content = file.read()
        
        # Dividir el contenido en comandos individuales
        commands = sql_content.split(';')
        
        # Ejecutar solo las partes relacionadas con rutinas
        rutinas_section = False
        for command in commands:
            command = command.strip()
            if command.startswith('-- ==========================================='):
                rutinas_section = True
                continue
            
            if rutinas_section and command:
                try:
                    cursor.execute(command)
                    print(f"Ejecutado: {command[:50]}...")
                except mysql.connector.Error as e:
                    if "already exists" not in str(e).lower():
                        print(f"Error en comando: {e}")
                        print(f"Comando: {command[:100]}...")
        
        # Confirmar cambios
        connection.commit()
        print("Tablas de rutinas creadas exitosamente")
        
        # Verificar que las tablas se crearon
        cursor.execute("SHOW TABLES LIKE '%rutina%'")
        rutina_tables = cursor.fetchall()
        print(f"Tablas de rutinas encontradas: {[table[0] for table in rutina_tables]}")
        
        # Verificar que las categorías se insertaron
        cursor.execute("SELECT COUNT(*) FROM categorias_ejercicios")
        categorias_count = cursor.fetchone()[0]
        print(f"Categorías de ejercicios insertadas: {categorias_count}")
        
        # Verificar que los ejercicios se insertaron
        cursor.execute("SELECT COUNT(*) FROM ejercicios")
        ejercicios_count = cursor.fetchone()[0]
        print(f"Ejercicios insertados: {ejercicios_count}")
        
        # Verificar que las rutinas se insertaron
        cursor.execute("SELECT COUNT(*) FROM rutinas")
        rutinas_count = cursor.fetchone()[0]
        print(f"Rutinas insertadas: {rutinas_count}")
        
    except mysql.connector.Error as e:
        print(f"Error de MySQL: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("Conexión cerrada")

if __name__ == "__main__":
    setup_rutinas()


