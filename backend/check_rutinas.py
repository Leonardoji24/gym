import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

try:
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    
    cursor = connection.cursor(dictionary=True)
    
    # Verificar rutinas
    cursor.execute('SELECT * FROM rutinas')
    rutinas = cursor.fetchall()
    print('Rutinas creadas:')
    for r in rutinas:
        print(f'ID: {r["id"]}, Nombre: {r["nombre"]}, Entrenador: {r["id_entrenador"]}')
    
    # Verificar categorías
    cursor.execute('SELECT * FROM categorias_ejercicios')
    categorias = cursor.fetchall()
    print(f'\nCategorías creadas: {len(categorias)}')
    
    # Verificar ejercicios
    cursor.execute('SELECT * FROM ejercicios LIMIT 5')
    ejercicios = cursor.fetchall()
    print(f'Ejercicios creados (mostrando 5):')
    for e in ejercicios:
        print(f'- {e["nombre"]} ({e["categoria_id"]})')
    
    connection.close()
    
except Exception as e:
    print(f"Error: {e}")





