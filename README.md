# Simulación de Tráfico en Redondel usando Método Monte Carlo

[![Universidad](https://img.shields.io/badge/Universidad-Nacional%20de%20Loja-blue)](https://unl.edu.ec/)
[![Materia](https://img.shields.io/badge/Materia-Simulación-green)](https://github.com)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow)](https://www.python.org/)

---

## Introducción

Este proyecto implementa un modelo de simulación estocástica basado en el **Método de Monte Carlo** para analizar el comportamiento del tráfico vehicular en un redondel circular. El tráfico vehicular es inherentemente impredecible debido a factores humanos como el tiempo de reacción, la velocidad de circulación y las decisiones de frenado. Mediante la generación de múltiples escenarios aleatorios, este modelo permite cuantificar la eficiencia del sistema y evaluar la probabilidad de colisiones bajo diferentes condiciones de operación.

La simulación modela un evento crítico: cuando un vehículo frena abruptamente dentro del redondel, generando una reacción en cadena que afecta a los vehículos circundantes. Este fenómeno se analiza a través de iteraciones Monte Carlo para obtener estimaciones estadísticamente significativas del comportamiento del sistema.

---

## Fundamentación Teórica

### Método de Monte Carlo

El Método de Monte Carlo es una técnica computacional que utiliza muestreo aleatorio repetido para obtener resultados numéricos. En sistemas complejos donde el análisis determinístico es intractable, este método proporciona aproximaciones estadísticas mediante:

1. **Generación de escenarios aleatorios**: Cada iteración representa una realización posible del sistema.
2. **Evaluación del sistema**: Se calcula el estado resultante para cada escenario.
3. **Agregación estadística**: Los resultados se promedian sobre todas las iteraciones para estimar valores esperados y varianzas.

La convergencia del método está garantizada por la **Ley de los Grandes Números**, donde el error estándar decrece proporcionalmente a $\frac{1}{\sqrt{N}}$, siendo $N$ el número de iteraciones.

---

## Definición del Modelo

### Variables del Sistema

El modelo considera las siguientes variables de estado para cada vehículo $i$:

- **Posición angular** $\theta_i(t)$: Ubicación del vehículo en el redondel (radianes)
- **Velocidad lineal** $v_i(t)$: Velocidad instantánea del vehículo (m/s)
- **Estado de frenado** $f_i(t) \in \{0, 1\}$: Indicador binario de frenado activo

### Variables Aleatorias

El carácter estocástico del modelo proviene de las siguientes variables aleatorias:

#### 1. Selección del Vehículo Problema
La selección del vehículo que inicia el evento de frenado sigue una **distribución uniforme discreta**:

$$P(V = v_i) = \frac{1}{N}, \quad i = 1, 2, \ldots, N$$

donde $N$ es el número total de vehículos en el redondel.

#### 2. Tiempo de Reacción del Conductor
Cada conductor tiene un tiempo de reacción $T_r \sim \text{Constante}$ de 0.5 segundos. En implementaciones avanzadas, este parámetro puede modelarse como:

$$T_r \sim \mathcal{N}(\mu = 0.5, \sigma^2 = 0.1)$$

siguiendo una distribución normal para capturar la variabilidad humana.

#### 3. Distribución Inicial de Vehículos
Los vehículos se distribuyen uniformemente en el círculo con ángulo inicial:

$$\theta_i(0) = \frac{2\pi i}{N}, \quad i = 0, 1, \ldots, N-1$$

### Parámetros Físicos del Modelo

| Parámetro | Símbolo | Valor | Unidad | Descripción |
|-----------|---------|-------|--------|-------------|
| Radio del redondel | $R$ | 50.0 | m | Radio de la trayectoria circular |
| Velocidad normal | $v_0$ | 10.0 | m/s | Velocidad de operación (36 km/h) |
| Aceleración de frenado | $a_f$ | -5.0 | m/s² | Desaceleración al frenar |
| Aceleración normal | $a_n$ | 2.0 | m/s² | Aceleración al retomar velocidad |
| Distancia de seguridad | $d_s$ | 5.0 | m | Distancia mínima entre vehículos |
| Tiempo de reacción | $T_r$ | 0.5 | s | Retardo del conductor |
| Paso de tiempo | $\Delta t$ | 0.1 | s | Intervalo de discretización |

### Dinámica del Sistema

#### Actualización de Posición
La posición angular se actualiza mediante integración numérica de Euler:

$$\theta_i(t + \Delta t) = \theta_i(t) + \frac{v_i(t)}{R} \Delta t$$

#### Actualización de Velocidad
La velocidad se ajusta según el estado de frenado y la distancia al vehículo adelante:

$$v_i(t + \Delta t) = \begin{cases}
v_i(t) + a_f \Delta t & \text{si } f_i(t) = 1 \text{ (frenando)} \\
v_i(t) + a_n \Delta t & \text{si } d_i < d_s \text{ (muy cerca)} \\
v_0 & \text{si } d_i \geq d_s \text{ (distancia segura)}
\end{cases}$$

donde $d_i$ es la distancia al vehículo adelante:

$$d_i = R \cdot |\theta_{i+1} - \theta_i|$$

### Lógica de Decisión

El modelo implementa las siguientes reglas de comportamiento:

1. **Detección de Proximidad**: Si $d_i < d_s$, el vehículo $i$ detecta peligro.
2. **Tiempo de Reacción**: Existe un retardo de $T_r$ segundos antes de que el vehículo reaccione.
3. **Reacción en Cadena**: Cuando un vehículo frena, activa el comportamiento de frenado en el vehículo inmediatamente detrás si éste se encuentra dentro de la distancia crítica.

### Criterios de Colisión

Se considera que ocurre una colisión si:

$$d_i < L_v$$

donde $L_v = 4.5$ m es la longitud promedio de un vehículo.

---

## Arquitectura del Software

### Estructura del Proyecto

```
Simulacion_Redondel_GrupoB/
│
├── main.py                 # Punto de entrada de la aplicación
├── requirements.txt        # Dependencias del proyecto
│
├── core/
│   └── simulacion.py      # Motor de simulación Monte Carlo
│
├── models/
│   ├── redondel.py        # Modelo del redondel circular
│   └── vehiculo.py        # Modelo de agente vehicular
│
└── utils/
    └── constantes.py      # Parámetros de configuración
```

### Componentes Principales

#### 1. Clase `Simulacion` (Monte Carlo Engine)
Controla la ejecución de experimentos Monte Carlo individuales:
- Inicialización de condiciones aleatorias
- Integración temporal del sistema
- Recopilación de métricas estadísticas

#### 2. Clase `Redondel`
Representa el espacio de estados del sistema:
- Gestión de la geometría circular
- Detección de relaciones entre vehículos
- Verificación de colisiones

#### 3. Clase `Vehiculo`
Agente individual con comportamiento autónomo:
- Dinámica de movimiento
- Lógica de reacción
- Registro de eventos (frenado, colisión)

---

## Instalación y Dependencias

### Requisitos del Sistema

- **Python**: 3.8 o superior
- **Sistema Operativo**: Windows, Linux o macOS

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/DaviYelan/Simulacion_Redondel_GrupoB.git
   cd Simulacion_Redondel_GrupoB
   ```

2. **Crear entorno virtual** (recomendado):
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

### Dependencias Principales

El proyecto utiliza únicamente la **biblioteca estándar de Python**:
- `random`: Generación de números pseudoaleatorios
- `math`: Funciones matemáticas (trigonometría)

Para análisis estadístico avanzado (opcional):
- `numpy`: Cálculos numéricos vectorizados
- `scipy`: Funciones estadísticas
- `pandas`: Manipulación de datos tabulares

---

## Ejecución de la Simulación

### Modo Interactivo

Ejecutar el programa principal con menú interactivo:

```bash
python main.py
```

**Opciones disponibles**:
1. **Simulación simple**: Ejecuta un experimento Monte Carlo único
2. **Análisis de distancia de seguridad**: Barre el espacio de parámetros $d_s$
3. **Salir**: Termina la aplicación

### Modo Programático

Para ejecutar simulaciones personalizadas, importar los módulos:

```python
from core.simulacion import Simulacion

# Crear instancia de simulación
sim = Simulacion(
    num_vehiculos=10,
    distancia_seguridad=5.0
)

# Ejecutar experimento Monte Carlo
resultados = sim.ejecutar_completa(
    duracion=30.0,
    tiempo_inicio_frenado=5.0,
    seed=42  # Semilla para reproducibilidad
)

# Analizar resultados
print(f"Colisiones: {resultados['hubo_colisiones']}")
print(f"Vehículos afectados: {resultados['vehiculos_afectados']}")
```

---

## Configuración de la Simulación

### Parámetros Ajustables

Los parámetros se configuran en `utils/constantes.py`:

```python
# Parámetros del experimento Monte Carlo
NUMERO_VEHICULOS = 10           # Población de agentes
DISTANCIA_SEGURIDAD = 5.0       # Variable independiente (m)
DURACION_SIMULACION = 30.0      # Tiempo de observación (s)

# Parámetros físicos
VELOCIDAD_NORMAL = 10.0         # Velocidad de régimen (m/s)
RADIO_REDONDEL = 50.0           # Escala espacial (m)

# Parámetros numéricos
DT = 0.1                        # Paso de integración (s)
```

### Control de Reproducibilidad

Para garantizar reproducibilidad científica, especificar la semilla del generador pseudoaleatorio:

```python
resultados = sim.ejecutar_completa(seed=42)
```

La misma semilla produce secuencias idénticas de números aleatorios, permitiendo validación de resultados.

### Número de Iteraciones Monte Carlo

Para análisis estadístico robusto, ejecutar múltiples realizaciones:

```python
N_ITERACIONES = 1000
resultados_monte_carlo = []

for i in range(N_ITERACIONES):
    sim = Simulacion(num_vehiculos=10, distancia_seguridad=5.0)
    resultado = sim.ejecutar_completa(duracion=30.0, seed=i)
    resultados_monte_carlo.append(resultado)
```

El error estándar de las estimaciones disminuye como $O(N^{-1/2})$.

---

## Análisis de Resultados

### Métricas de Salida

Cada experimento Monte Carlo genera las siguientes métricas:

#### Métricas Binarias
- **`hubo_colisiones`**: Indicador de colisión ($\in \{0, 1\}$)
- **`vehiculo_problema_id`**: Identificador del vehículo que inició el evento

#### Métricas Cuantitativas
- **`vehiculos_afectados`**: Número de vehículos que tuvieron que frenar
- **`total_vehiculos`**: Población total $N$
- **`porcentaje_afectados`**: $\frac{\text{vehículos\_afectados}}{N} \times 100\%$

#### Series Temporales
- **`historial`**: Array de estados del sistema en cada paso $t_k = k \Delta t$

### Análisis Estadístico

#### 1. Tasa de Colisión
Proporción de experimentos que resultaron en colisión:

$$P(\text{colisión}) = \frac{1}{N_{\text{exp}}} \sum_{i=1}^{N_{\text{exp}}} \mathbb{1}_{\{\text{colisión}_i\}}$$

#### 2. Vehículos Afectados Esperados
Valor esperado del número de vehículos que reaccionan:

$$\mathbb{E}[\text{afectados}] = \frac{1}{N_{\text{exp}}} \sum_{i=1}^{N_{\text{exp}}} \text{afectados}_i$$

Con intervalo de confianza al 95%:

$$\text{IC}_{95\%} = \bar{x} \pm 1.96 \frac{s}{\sqrt{N_{\text{exp}}}}$$

donde $s$ es la desviación estándar muestral.

#### 3. Análisis de Sensibilidad
Variación de la tasa de colisión respecto a la distancia de seguridad:

$$\frac{\partial P(\text{colisión})}{\partial d_s} \approx \frac{P(d_s + \Delta d) - P(d_s)}{\Delta d}$$

### Interpretación de Resultados

**Criterios de Seguridad**:
- $P(\text{colisión}) < 0.01$ : Sistema seguro
- $0.01 \leq P(\text{colisión}) < 0.05$ : Sistema marginalmente seguro
- $P(\text{colisión}) \geq 0.05$ : Sistema inseguro (requiere reconfiguración)

**Eficiencia del Tráfico**:
- $\mathbb{E}[\text{afectados}] < 0.3N$ : Reacción localizada (eficiente)
- $\mathbb{E}[\text{afectados}] \geq 0.3N$ : Propagación extendida (ineficiente)

---

## Validación del Modelo

### Verificación Física

El modelo satisface las siguientes propiedades físicas:

1. **Conservación del orden**: Los vehículos no se adelantan
2. **Velocidad acotada**: $0 \leq v_i(t) \leq v_0$
3. **Causalidad temporal**: La reacción ocurre después del estímulo

### Validación Estadística

Para $N \to \infty$ iteraciones Monte Carlo:
- Los estimadores convergen a sus valores verdaderos (Ley de Grandes Números)
- Las distribuciones empíricas convergen a las teóricas (Teorema Central del Límite)

---

## Limitaciones y Trabajo Futuro

### Limitaciones Actuales

1. **Modelo Determinístico de Reacción**: Tiempo de reacción fijo ($T_r = 0.5$ s)
2. **Geometría Simplificada**: No considera carriles ni salidas del redondel
3. **Comportamiento Homogéneo**: Todos los conductores reaccionan idénticamente

### Extensiones Propuestas

1. **Variabilidad Estocástica**: Modelar $T_r$ y $v_0$ con distribuciones probabilísticas
2. **Múltiples Carriles**: Incorporar cambios de carril y adelantamientos
3. **Entrada/Salida Dinámica**: Simulación con flujo vehicular variable
4. **Validación Empírica**: Calibración con datos reales de tráfico

---

## Referencias

1. Rubinstein, R. Y., & Kroese, D. P. (2016). *Simulation and the Monte Carlo Method* (3rd ed.). Wiley.
2. Law, A. M. (2015). *Simulation Modeling and Analysis* (5th ed.). McGraw-Hill.
3. Nagel, K., & Schreckenberg, M. (1992). A cellular automaton model for freeway traffic. *Journal de Physique I*, 2(12), 2221-2229.
4. Helbing, D., & Tilch, B. (1998). Generalized force model of traffic dynamics. *Physical Review E*, 58(1), 133.

---

## Autores

Este proyecto fue desarrollado como parte del curso de **Simulación** en la **Universidad Nacional de Loja**.

- **Miguel Luna** - 
- **Luis Armijos** - 
- **Ariana Sarango** - 
- **Francisco Jaramillo** - 

---

## Contacto

Para consultas académicas o técnicas sobre este proyecto:

- **Repositorio**: [https://github.com/DaviYelan/Simulacion_Redondel_GrupoB](https://github.com/DaviYelan/Simulacion_Redondel_GrupoB)
- **Universidad Nacional de Loja**: [https://unl.edu.ec/](https://unl.edu.ec/)

---

*Desarrollado con fines académicos - Universidad Nacional de Loja © 2025*
