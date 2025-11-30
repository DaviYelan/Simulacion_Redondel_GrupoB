import math
from utils.constantes import (
    VELOCIDAD_NORMAL, ACELERACION_FRENADO, ACELERACION_NORMAL,
    LONGITUD_VEHICULO, TIEMPO_REACCION
)


class Vehiculo:
    """
    Representa un vehículo circulando en el redondel
    """
    
    def __init__(self, id_vehiculo, angulo_inicial, radio_redondel):
        """
        Inicializa un vehículo
        
        Args:
            id_vehiculo (int): Identificador único del vehículo
            angulo_inicial (float): Ángulo inicial en radianes
            radio_redondel (float): Radio del redondel en metros
        """
        self.id = id_vehiculo
        self.angulo = angulo_inicial  # posición angular en radianes
        self.velocidad = VELOCIDAD_NORMAL  # velocidad lineal en m/s
        self.radio = radio_redondel
        self.frenando = False
        self.tiempo_frenado = 0.0
        self.es_vehiculo_problema = False
        self.tiempo_reaccion_restante = 0.0
        
        # Estadísticas
        self.tuvo_que_frenar = False
        self.colisiono = False
        
    def marcar_como_problema(self):
        """Marca este vehículo como el que causará el frenado intencional"""
        self.es_vehiculo_problema = True
        
    def iniciar_frenado(self):
        """Inicia el frenado del vehículo problema"""
        if self.es_vehiculo_problema:
            self.frenando = True
            self.tiempo_frenado = 0.0
            
    def detectar_vehiculo_adelante(self, vehiculo_adelante, distancia_seguridad):
        """
        Detecta si hay un vehículo adelante dentro de la distancia de seguridad
        
        Args:
            vehiculo_adelante (Vehiculo): Vehículo que está adelante
            distancia_seguridad (float): Distancia de seguridad en metros
            
        Returns:
            tuple: (necesita_frenar, distancia_actual)
        """
        # Calcular la diferencia angular
        diff_angular = vehiculo_adelante.angulo - self.angulo
        
        # Normalizar la diferencia angular al rango [0, 2π]
        if diff_angular < 0:
            diff_angular += 2 * math.pi
            
        # Convertir diferencia angular a distancia lineal
        distancia = diff_angular * self.radio
        
        # Restar la longitud del vehículo de adelante
        distancia -= LONGITUD_VEHICULO
        
        # Determinar si necesita frenar
        necesita_frenar = distancia < distancia_seguridad and vehiculo_adelante.velocidad < self.velocidad
        
        return necesita_frenar, distancia
        
    def actualizar(self, dt, vehiculo_adelante=None, distancia_seguridad=5.0):
        """
        Actualiza el estado del vehículo
        
        Args:
            dt (float): Intervalo de tiempo en segundos
            vehiculo_adelante (Vehiculo): Vehículo que está adelante (si existe)
            distancia_seguridad (float): Distancia de seguridad en metros
        """
        # Actualizar tiempo de reacción
        if self.tiempo_reaccion_restante > 0:
            self.tiempo_reaccion_restante -= dt
            
        # Si es el vehículo problema y está frenando
        if self.es_vehiculo_problema and self.frenando:
            self.tiempo_frenado += dt
            self.velocidad = max(0, self.velocidad + ACELERACION_FRENADO * dt)
            
            # Después de 2 segundos, retomar velocidad
            if self.tiempo_frenado >= 2.0:
                self.frenando = False
                
        # Si no es el vehículo problema, reaccionar a vehículos adelante
        elif vehiculo_adelante is not None and self.tiempo_reaccion_restante <= 0:
            necesita_frenar, distancia = self.detectar_vehiculo_adelante(
                vehiculo_adelante, distancia_seguridad
            )
            
            if necesita_frenar:
                # Frenar para evitar colisión
                self.velocidad = max(0, self.velocidad + ACELERACION_FRENADO * dt)
                self.tuvo_que_frenar = True
                self.tiempo_reaccion_restante = TIEMPO_REACCION
                
                # Verificar colisión
                if distancia < 0:
                    self.colisiono = True
            else:
                # Acelerar hasta velocidad normal
                if self.velocidad < VELOCIDAD_NORMAL:
                    self.velocidad = min(VELOCIDAD_NORMAL, 
                                       self.velocidad + ACELERACION_NORMAL * dt)
        else:
            # Acelerar hasta velocidad normal si no hay problema adelante
            if self.velocidad < VELOCIDAD_NORMAL:
                self.velocidad = min(VELOCIDAD_NORMAL, 
                                   self.velocidad + ACELERACION_NORMAL * dt)
        
        # Actualizar posición angular
        velocidad_angular = self.velocidad / self.radio
        self.angulo += velocidad_angular * dt
        
        # Normalizar ángulo al rango [0, 2π]
        if self.angulo >= 2 * math.pi:
            self.angulo -= 2 * math.pi
            
    def obtener_posicion_cartesiana(self):
        """
        Convierte la posición angular a coordenadas cartesianas
        
        Returns:
            tuple: (x, y) posición en el plano
        """
        x = self.radio * math.cos(self.angulo)
        y = self.radio * math.sin(self.angulo)
        return x, y
        
    def obtener_estado(self):
        """
        Obtiene el estado actual del vehículo
        
        Returns:
            dict: Diccionario con información del estado
        """
        x, y = self.obtener_posicion_cartesiana()
        return {
            'id': self.id,
            'angulo': self.angulo,
            'velocidad': self.velocidad,
            'x': x,
            'y': y,
            'frenando': self.frenando,
            'es_problema': self.es_vehiculo_problema,
            'tuvo_que_frenar': self.tuvo_que_frenar,
            'colisiono': self.colisiono
        }