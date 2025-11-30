from core.simulacion import Simulacion
from utils.constantes import DISTANCIA_SEGURIDAD, NUMERO_VEHICULOS

def ejecutar_simulacion_simple():
    """
    Ejecuta una simulación simple y muestra los resultados
    """
    print("="*60)
    print("SIMULACIÓN DE TRÁFICO EN REDONDEL")
    print("Validando la teoría del error humano en nudos de tráfico")
    print("="*60)
    print()
    
    # Crear simulación
    print("Configuración de la simulación:")
    print(f"  - Número de vehículos: {NUMERO_VEHICULOS}")
    print(f"  - Distancia de seguridad: {DISTANCIA_SEGURIDAD} metros")
    print()
    
    sim = Simulacion(num_vehiculos=NUMERO_VEHICULOS, 
                    distancia_seguridad=DISTANCIA_SEGURIDAD)
    
    # Ejecutar simulación
    print("Iniciando simulación...")
    resultados = sim.ejecutar_completa(duracion=30.0, tiempo_inicio_frenado=5.0, seed=42)
    
    # Mostrar resultados
    print()
    print("="*60)
    print("RESULTADOS DE LA SIMULACIÓN")
    print("="*60)
    print(f"Vehículo que frenó: #{resultados['vehiculo_problema_id']}")
    print(f"Duración de la simulación: {resultados['duracion']} segundos")
    print()
    print(f"¿Hubo colisiones?: {'SÍ' if resultados['hubo_colisiones'] else 'NO'}")
    print(f"Vehículos afectados: {resultados['vehiculos_afectados']}/{resultados['total_vehiculos']}")
    print(f"Porcentaje de vehículos afectados: {(resultados['vehiculos_afectados']/resultados['total_vehiculos'])*100:.1f}%")
    print()
    
    if resultados['hubo_colisiones']:
        print("  ADVERTENCIA: Se detectaron colisiones durante la simulación")
        print("   Esto indica que la distancia de seguridad podría ser insuficiente.")
    else:
        print("✓ No se detectaron colisiones")
        print("  La distancia de seguridad fue adecuada para evitar accidentes.")
    print()


def ejecutar_pruebas_distancia():
    """
    Ejecuta múltiples simulaciones con diferentes distancias de seguridad
    """
    print("="*60)
    print("ANÁLISIS DE DISTANCIA DE SEGURIDAD")
    print("="*60)
    print()
    
    distancias = [3, 4, 5, 6, 7, 8]
    
    print(f"{'Distancia (m)':<15} {'Colisiones':<15} {'Vehículos Afectados':<25}")
    print("-"*55)
    
    for distancia in distancias:
        sim = Simulacion(num_vehiculos=NUMERO_VEHICULOS, 
                        distancia_seguridad=distancia)
        resultados = sim.ejecutar_completa(duracion=30.0, tiempo_inicio_frenado=5.0, seed=42)
        
        colision_str = "SÍ" if resultados['hubo_colisiones'] else "NO"
        afectados_str = f"{resultados['vehiculos_afectados']}/{resultados['total_vehiculos']}"
        
        print(f"{distancia:<15} {colision_str:<15} {afectados_str:<25}")
    
    print()


def menu_principal():
    """
    Menú principal para ejecutar diferentes tipos de simulaciones
    """
    while True:
        print()
        print("="*60)
        print("MENÚ PRINCIPAL - SIMULACIÓN DE TRÁFICO")
        print("="*60)
        print("1. Ejecutar simulación simple")
        print("2. Análisis de distancia de seguridad")
        print("3. Salir")
        print()
        
        opcion = input("Seleccione una opción (1-3): ").strip()
        
        if opcion == "1":
            print()
            ejecutar_simulacion_simple()
            input("\nPresione Enter para continuar...")
        elif opcion == "2":
            print()
            ejecutar_pruebas_distancia()
            input("\nPresione Enter para continuar...")
        elif opcion == "3":
            print("\n¡Hasta luego!")
            break
        else:
            print("\nOpción no válida. Por favor, seleccione 1, 2 o 3.")


if __name__ == "__main__":
    menu_principal()