import mysql.connector
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

def crear_rutinas_simples():
    try:
        # Conectar a la base de datos
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'gym_db')
        )
        
        cursor = connection.cursor()
        
        print("Conectado a la base de datos exitosamente")
        
        # Limpiar rutinas existentes (opcional)
        cursor.execute("DELETE FROM ejercicios_rutina")
        cursor.execute("DELETE FROM dias_rutina")
        cursor.execute("DELETE FROM rutinas WHERE id > 13")
        
        # ID del entrenador principal
        entrenador_id = 5
        
        # 1. RUTINA PRINCIPIANTE - FULL BODY
        print("\n1. Creando Rutina Principiante - Full Body...")
        
        # Insertar rutina
        cursor.execute("""
            INSERT INTO rutinas (nombre, descripcion, duracion_semanas, nivel, 
                                objetivo, id_entrenador, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            "Rutina Principiante - Full Body",
            "Rutina completa para principiantes que trabaja todo el cuerpo en cada sesión",
            4,
            "principiante",
            "fuerza",
            entrenador_id
        ))
        rutina_id = cursor.lastrowid
        print(f"Rutina creada con ID: {rutina_id}")
        
        # Día 1: Full Body
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 1 - Full Body", "Entrenamiento completo de todo el cuerpo", 1))
        dia_id = cursor.lastrowid
        print(f"Día creado con ID: {dia_id}")
        
        # Ejercicios del día 1
        ejercicios_dia1 = [
            (1, 3, "10", "0", 90),  # Flexiones
            (2, 3, "15", "0", 90),  # Sentadillas
            (3, 3, "8", "0", 90),   # Pull-ups
            (4, 3, "12", "0", 90),  # Fondos en silla
            (5, 3, "20", "0", 90),  # Plancha
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_dia1, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
            print(f"Ejercicio {i} insertado")
        
        # 2. RUTINA INTERMEDIA - PUSH/PULL/LEGS
        print("\n2. Creando Rutina Intermedia - Push/Pull/Legs...")
        
        cursor.execute("""
            INSERT INTO rutinas (nombre, descripcion, duracion_semanas, nivel, 
                                objetivo, id_entrenador, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            "Rutina Intermedia - Push/Pull/Legs",
            "Rutina dividida en 3 días: empuje, jalón y piernas",
            6,
            "intermedio",
            "ganancia_muscular",
            entrenador_id
        ))
        rutina_id = cursor.lastrowid
        print(f"Rutina creada con ID: {rutina_id}")
        
        # Día 1: Push (Empuje)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 1 - Push", "Pecho, hombros y tríceps", 1))
        dia_id = cursor.lastrowid
        
        ejercicios_push = [
            (1, 4, "12", "0", 90),   # Flexiones
            (6, 3, "10", "0", 90),   # Press de hombros
            (7, 3, "12", "0", 90),   # Fondos en paralelas
            (8, 3, "15", "0", 90),   # Flexiones diamante
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_push, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 2: Pull (Jalón)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 2 - Pull", "Espalda y bíceps", 2))
        dia_id = cursor.lastrowid
        
        ejercicios_pull = [
            (3, 4, "8", "0", 90),    # Pull-ups
            (9, 3, "12", "0", 90),   # Remo con peso corporal
            (10, 3, "15", "0", 90),  # Superman
            (11, 3, "20", "0", 90),  # Puente de glúteos
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_pull, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 3: Legs (Piernas)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 3 - Legs", "Piernas y glúteos", 3))
        dia_id = cursor.lastrowid
        
        ejercicios_legs = [
            (2, 4, "15", "0", 90),   # Sentadillas
            (12, 3, "12", "0", 90),  # Zancadas
            (13, 3, "20", "0", 90),  # Sentadillas sumo
            (14, 3, "15", "0", 90),  # Elevación de pantorrillas
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_legs, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        connection.commit()
        print("\n✅ Rutinas simples creadas exitosamente!")
        print(f"Se crearon 2 rutinas nuevas con ejercicios organizados por días")
        
    except mysql.connector.Error as e:
        print(f"Error de MySQL: {e}")
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
    except Exception as e:
        print(f"Error: {e}")
        if 'connection' in locals() and connection and connection.is_connected():
            connection.rollback()
    finally:
        if 'connection' in locals() and connection and connection.is_connected():
            cursor.close()
            connection.close()
            print("Conexión cerrada")

if __name__ == "__main__":
    crear_rutinas_simples()
