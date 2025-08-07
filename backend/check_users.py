import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

connection = mysql.connector.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', ''),
    database=os.getenv('DB_NAME', 'gym_db')
)

cursor = connection.cursor(dictionary=True)

print('Usuarios disponibles:')
cursor.execute("SELECT id, nombre, email, rol_id FROM miembros LIMIT 10")
usuarios = cursor.fetchall()

for usuario in usuarios:
    print(f"ID: {usuario['id']}, Nombre: {usuario['nombre']}, Email: {usuario['email']}, Rol: {usuario['rol_id']}")

cursor.close()
connection.close()
