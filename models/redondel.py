import math
from models.vehiculo import Vehiculo
from utils.constantes import RADIO_REDONDEL


class Redondel:
    """
    Representa el redondel circular donde circulan los vehículos
    """
    
    def __init__(self, radio=RADIO_REDONDEL, num_vehiculos=10):
        """
        Inicializa el redondel con vehículos distribuidos uniformemente
        
        Args:
            radio (float): Radio del redondel en metros
            num_vehiculos (int): Número de vehículos en el redondel
        """
        self.radio = radio
        self.num_vehiculos = num_vehiculos
        self.vehiculos = []
        self._inicializar_vehiculos()
        
    def _inicializar_vehiculos(self):
        """Crea y distribuye los vehículos uniformemente en el redondel"""
        angulo_entre_vehiculos = (2 * math.pi) / self.num_vehiculos
        
        for i in range(self.num_vehiculos):
            angulo_inicial = i * angulo_entre_vehiculos
            vehiculo = Vehiculo(i, angulo_inicial, self.radio)
            self.vehiculos.append(vehiculo)
            
        # Ordenar vehículos por ángulo
        self.vehiculos.sort(key=lambda v: v.angulo)
        
    def obtener_vehiculo_adelante(self, vehiculo):
        """
        Obtiene el vehículo que está adelante del vehículo dado
        
        Args:
            vehiculo (Vehiculo): Vehículo de referencia
            
        Returns:
            Vehiculo: Vehículo que está adelante
        """
        # Encontrar índice del vehículo actual
        indice = self.vehiculos.index(vehiculo)
        
        # El vehículo adelante es el siguiente en la lista (circular)
        indice_adelante = (indice + 1) % len(self.vehiculos)
        
        return self.vehiculos[indice_adelante]
        
    def actualizar(self, dt, distancia_seguridad):
        """
        Actualiza todos los vehículos en el redondel
        
        Args:
            dt (float): Intervalo de tiempo
            distancia_seguridad (float): Distancia de seguridad entre vehículos
        """
        # Actualizar cada vehículo considerando el vehículo adelante
        for vehiculo in self.vehiculos:
            vehiculo_adelante = self.obtener_vehiculo_adelante(vehiculo)
            vehiculo.actualizar(dt, vehiculo_adelante, distancia_seguridad)
            
        # Reordenar vehículos por ángulo después de la actualización
        self.vehiculos.sort(key=lambda v: v.angulo)
        
    def obtener_estados(self):
        """
        Obtiene el estado de todos los vehículos
        
        Returns:
            list: Lista de diccionarios con el estado de cada vehículo
        """
        return [vehiculo.obtener_estado() for vehiculo in self.vehiculos]
        
    def obtener_vehiculo_por_id(self, id_vehiculo):
        """
        Obtiene un vehículo por su ID
        
        Args:
            id_vehiculo (int): ID del vehículo
            
        Returns:
            Vehiculo: Vehículo con el ID especificado
        """
        for vehiculo in self.vehiculos:
            if vehiculo.id == id_vehiculo:
                return vehiculo
        return None
        
    def hay_colisiones(self):
        """
        Verifica si hubo alguna colisión
        
        Returns:
            bool: True si hubo colisión, False en caso contrario
        """
        return any(vehiculo.colisiono for vehiculo in self.vehiculos)
        
    def contar_vehiculos_afectados(self):
        """
        Cuenta cuántos vehículos tuvieron que frenar
        
        Returns:
            int: Número de vehículos que frenaron
        """
        return sum(1 for vehiculo in self.vehiculos if vehiculo.tuvo_que_frenar)