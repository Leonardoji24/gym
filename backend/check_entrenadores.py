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

# Verificar estructura de la tabla ejercicios_rutina
cursor.execute("DESCRIBE ejercicios_rutina")
columns = cursor.fetchall()
print('Estructura de la tabla ejercicios_rutina:')
for col in columns:
    print(f"  {col['Field']} - {col['Type']}")

cursor.close()
connection.close()
