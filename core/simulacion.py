import random
from models.redondel import Redondel
from utils.constantes import (
    DT, DURACION_FRENADO, DISTANCIA_SEGURIDAD,
    NUMERO_VEHICULOS, RADIO_REDONDEL
)


class Simulacion:
    """
    Controla la simulación del tráfico en el redondel
    """
    
    def __init__(self, num_vehiculos=NUMERO_VEHICULOS, radio=RADIO_REDONDEL, 
                distancia_seguridad=DISTANCIA_SEGURIDAD, dt=DT):
        """
        Inicializa la simulación
        
        Args:
            num_vehiculos (int): Número de vehículos en el redondel
            radio (float): Radio del redondel
            distancia_seguridad (float): Distancia de seguridad entre vehículos
            dt (float): Intervalo de tiempo de actualización
        """
        self.redondel = Redondel(radio, num_vehiculos)
        self.distancia_seguridad = distancia_seguridad
        self.dt = dt
        self.tiempo_actual = 0.0
        self.tiempo_inicio_frenado = None
        self.vehiculo_problema = None
        self.simulacion_iniciada = False
        self.simulacion_terminada = False
        
        # Historial de estados para análisis
        self.historial = []
        
    def seleccionar_vehiculo_aleatorio(self, seed=None):
        """
        Selecciona un vehículo aleatorio para que frene
        
        Args:
            seed (int, optional): Semilla para reproducibilidad
        """
        if seed is not None:
            random.seed(seed)
            
        # Seleccionar un vehículo aleatorio
        vehiculo_id = random.randint(0, len(self.redondel.vehiculos) - 1)
        self.vehiculo_problema = self.redondel.obtener_vehiculo_por_id(vehiculo_id)
        self.vehiculo_problema.marcar_como_problema()
        
        return vehiculo_id
        
    def iniciar_frenado(self, tiempo_inicio=5.0):
        """
        Inicia el frenado del vehículo problema en un tiempo específico
        
        Args:
            tiempo_inicio (float): Tiempo en el que inicia el frenado
        """
        self.tiempo_inicio_frenado = tiempo_inicio
        
    def actualizar(self):
        """
        Actualiza un paso de la simulación
        
        Returns:
            dict: Estado actual de la simulación
        """
        # Iniciar frenado si corresponde
        if (self.tiempo_inicio_frenado is not None and 
            self.tiempo_actual >= self.tiempo_inicio_frenado and 
            not self.simulacion_iniciada):
            self.vehiculo_problema.iniciar_frenado()
            self.simulacion_iniciada = True
            
        # Actualizar el redondel
        self.redondel.actualizar(self.dt, self.distancia_seguridad)
        
        # Incrementar tiempo
        self.tiempo_actual += self.dt
        
        # Guardar estado en historial
        estado_actual = {
            'tiempo': self.tiempo_actual,
            'vehiculos': self.redondel.obtener_estados(),
            'hay_colisiones': self.redondel.hay_colisiones()
        }
        self.historial.append(estado_actual)
        
        # Verificar si la simulación debe terminar
        if (self.simulacion_iniciada and 
            self.tiempo_actual > self.tiempo_inicio_frenado + DURACION_FRENADO + 10):
            self.simulacion_terminada = True
            
        return estado_actual
        
    def ejecutar_completa(self, duracion=30.0, tiempo_inicio_frenado=5.0, seed=None):
        """
        Ejecuta la simulación completa
        
        Args:
            duracion (float): Duración total de la simulación en segundos
            tiempo_inicio_frenado (float): Tiempo en que inicia el frenado
            seed (int, optional): Semilla para reproducibilidad
            
        Returns:
            dict: Resultados de la simulación
        """
        # Seleccionar vehículo problema
        vehiculo_id = self.seleccionar_vehiculo_aleatorio(seed)
        self.iniciar_frenado(tiempo_inicio_frenado)
        
        # Ejecutar simulación
        while self.tiempo_actual < duracion:
            self.actualizar()
            
        # Recopilar resultados
        resultados = {
            'vehiculo_problema_id': vehiculo_id,
            'hubo_colisiones': self.redondel.hay_colisiones(),
            'vehiculos_afectados': self.redondel.contar_vehiculos_afectados(),
            'total_vehiculos': len(self.redondel.vehiculos),
            'distancia_seguridad': self.distancia_seguridad,
            'duracion': duracion,
            'historial': self.historial
        }
        
        return resultados
        
    def obtener_estadisticas(self):
        """
        Obtiene estadísticas de la simulación
        
        Returns:
            dict: Diccionario con estadísticas
        """
        return {
            'tiempo_actual': self.tiempo_actual,
            'hubo_colisiones': self.redondel.hay_colisiones(),
            'vehiculos_afectados': self.redondel.contar_vehiculos_afectados(),
            'total_vehiculos': len(self.redondel.vehiculos),
            'simulacion_iniciada': self.simulacion_iniciada,
            'simulacion_terminada': self.simulacion_terminada
        }
        
    def reiniciar(self):
        """Reinicia la simulación"""
        self.redondel = Redondel(self.redondel.radio, self.redondel.num_vehiculos)
        self.tiempo_actual = 0.0
        self.tiempo_inicio_frenado = None
        self.vehiculo_problema = None
        self.simulacion_iniciada = False
        self.simulacion_terminada = False
        self.historial = []