import mysql.connector
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

def crear_rutinas_completas():
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
        
        # Día 1: Full Body
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 1 - Full Body", "Entrenamiento completo de todo el cuerpo", 1))
        dia_id = cursor.lastrowid
        
        # Ejercicios del día 1
        ejercicios_dia1 = [
            (1, 3, 10, 0, 90),  # Flexiones
            (2, 3, 15, 0, 90),  # Sentadillas
            (3, 3, 8, 0, 90),   # Pull-ups
            (4, 3, 12, 0, 90),  # Fondos en silla
            (5, 3, 20, 0, 90),  # Plancha
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_dia1, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # 2. RUTINA INTERMEDIA - PUSH/PULL/LEGS
        print("2. Creando Rutina Intermedia - Push/Pull/Legs...")
        
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
        
        # Día 1: Push (Empuje)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 1 - Push", "Pecho, hombros y tríceps", 1))
        dia_id = cursor.lastrowid
        
        ejercicios_push = [
            (1, 4, 12, 0, 90),   # Flexiones
            (6, 3, 10, 0, 90),   # Press de hombros
            (7, 3, 12, 0, 90),   # Fondos en paralelas
            (8, 3, 15, 0, 90),   # Flexiones diamante
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_push, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 2: Pull (Jalón)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 2 - Pull", "Espalda y bíceps", 2))
        dia_id = cursor.lastrowid
        
        ejercicios_pull = [
            (3, 4, 8, 0, 90),    # Pull-ups
            (9, 3, 12, 0, 90),   # Remo con peso corporal
            (10, 3, 15, 0, 90),  # Superman
            (11, 3, 20, 0, 90),  # Puente de glúteos
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_pull, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 3: Legs (Piernas)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 3 - Legs", "Piernas y glúteos", 3))
        dia_id = cursor.lastrowid
        
        ejercicios_legs = [
            (2, 4, 15, 0, 90),   # Sentadillas
            (12, 3, 12, 0, 90),  # Zancadas
            (13, 3, 20, 0, 90),  # Sentadillas sumo
            (14, 3, 15, 0, 90),  # Elevación de pantorrillas
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_legs, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # 3. RUTINA AVANZADA - UPPER/LOWER
        print("3. Creando Rutina Avanzada - Upper/Lower...")
        
        cursor.execute("""
            INSERT INTO rutinas (nombre, descripcion, duracion_semanas, nivel, 
                                objetivo, id_entrenador, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            "Rutina Avanzada - Upper/Lower",
            "Rutina dividida en 4 días: tren superior e inferior",
            8,
            "avanzado",
            "fuerza",
            entrenador_id
        ))
        rutina_id = cursor.lastrowid
        
        # Día 1: Upper A (Tren Superior A)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 1 - Upper A", "Pecho y tríceps", 1))
        dia_id = cursor.lastrowid
        
        ejercicios_upper_a = [
            (1, 5, 8, 0, 120),   # Flexiones
            (6, 4, 10, 0, 120),  # Press de hombros
            (7, 4, 10, 0, 120),  # Fondos en paralelas
            (8, 3, 12, 0, 90),   # Flexiones diamante
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_upper_a, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 2: Lower A (Tren Inferior A)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 2 - Lower A", "Cuádriceps y pantorrillas", 2))
        dia_id = cursor.lastrowid
        
        ejercicios_lower_a = [
            (2, 5, 12, 0, 120),  # Sentadillas
            (12, 4, 10, 0, 120), # Zancadas
            (14, 4, 15, 0, 90),  # Elevación de pantorrillas
            (15, 3, 20, 0, 90),  # Sentadillas con salto
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_lower_a, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 3: Upper B (Tren Superior B)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 3 - Upper B", "Espalda y bíceps", 3))
        dia_id = cursor.lastrowid
        
        ejercicios_upper_b = [
            (3, 5, 8, 0, 120),   # Pull-ups
            (9, 4, 12, 0, 120),  # Remo con peso corporal
            (10, 4, 15, 0, 90),  # Superman
            (16, 3, 12, 0, 90),  # Remo invertido
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_upper_b, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # Día 4: Lower B (Tren Inferior B)
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 4 - Lower B", "Glúteos e isquiotibiales", 4))
        dia_id = cursor.lastrowid
        
        ejercicios_lower_b = [
            (13, 4, 12, 0, 120), # Sentadillas sumo
            (11, 4, 15, 0, 120), # Puente de glúteos
            (17, 3, 12, 0, 90),  # Sentadillas búlgaras
            (18, 3, 20, 0, 90),  # Elevación de cadera
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_lower_b, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        # 4. RUTINA CARDIO - HIIT
        print("4. Creando Rutina Cardio - HIIT...")
        
        cursor.execute("""
            INSERT INTO rutinas (nombre, descripcion, duracion_semanas, nivel, 
                                objetivo, id_entrenador, fecha_creacion)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            "Rutina Cardio - HIIT",
            "Entrenamiento de alta intensidad para mejorar la resistencia cardiovascular",
            4,
            "intermedio",
            "perdida_peso",
            entrenador_id
        ))
        rutina_id = cursor.lastrowid
        
        # Día 1: HIIT Cardio
        cursor.execute("""
            INSERT INTO dias_rutina (rutina_id, nombre, descripcion, orden)
            VALUES (%s, %s, %s, %s)
        """, (rutina_id, "Día 1 - HIIT Cardio", "Entrenamiento de alta intensidad", 1))
        dia_id = cursor.lastrowid
        
        ejercicios_hiit = [
            (15, 5, 30, 0, 30),  # Sentadillas con salto (30 segundos)
            (19, 5, 30, 0, 30),  # Burpees (30 segundos)
            (20, 5, 30, 0, 30),  # Mountain climbers (30 segundos)
            (21, 5, 30, 0, 30),  # Jumping jacks (30 segundos)
            (22, 5, 30, 0, 30),  # High knees (30 segundos)
        ]
        
        for i, (ejercicio_id, series, repeticiones, peso, descanso) in enumerate(ejercicios_hiit, 1):
            cursor.execute("""
                INSERT INTO ejercicios_rutina (rutina_id, dia_rutina_id, ejercicio_id, 
                                              series, repeticiones, peso, tiempo_descanso, orden)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (rutina_id, dia_id, ejercicio_id, series, repeticiones, peso, descanso, i))
        
        connection.commit()
        print("\n✅ Rutinas completas creadas exitosamente!")
        print(f"Se crearon 4 rutinas nuevas con ejercicios organizados por días")
        
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
    crear_rutinas_completas()
