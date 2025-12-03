import os
import math
from typing import List, Optional

try:
    import pandas as pd
except Exception:
    pd = None

from core.simulacion import Simulacion
from utils.constantes import DISTANCIA_SEGURIDAD, RADIO_REDONDEL, NUMERO_VEHICULOS, DT


class MonteCarlo:
    """
    Clase para ejecutar experimentos Monte Carlo sobre la simulación del redondel.

    Ejecuta varias corridas cambiando la semilla y recoge métricas resumidas
    y por corrida. Permite exportar los resultados a Excel (si `pandas` +
    `openpyxl` están disponibles) o a CSV como respaldo.
    """

    def __init__(self,
                num_runs: int = 100,
                num_vehiculos: int = None,
                radio: float = None,
                duracion: float = 30.0,
                tiempo_inicio_frenado: float = 5.0,
                distancia_seguridad: float = None,
                dt: float = None):
        self.num_runs = int(num_runs)
        self.num_vehiculos = num_vehiculos if num_vehiculos is not None else NUMERO_VEHICULOS
        self.radio = radio if radio is not None else RADIO_REDONDEL
        self.duracion = duracion
        self.tiempo_inicio_frenado = tiempo_inicio_frenado
        self.distancia_seguridad = distancia_seguridad if distancia_seguridad is not None else DISTANCIA_SEGURIDAD
        self.dt = dt if dt is not None else DT

        self._runs = []  # lista de dicts con resultados por corrida

    def _run_single(self, seed: int):
        sim = Simulacion(num_vehiculos=self.num_vehiculos,
                         radio=self.radio,
                         distancia_seguridad=self.distancia_seguridad,
                         dt=self.dt)

        # Ejecutar completa con la semilla
        resultado = sim.ejecutar_completa(duracion=self.duracion,
                                          tiempo_inicio_frenado=self.tiempo_inicio_frenado,
                                          seed=seed)

        # Construir resumen de la corrida
        resumen = {
            'seed': seed,
            'vehiculo_problema_id': resultado.get('vehiculo_problema_id'),
            'hubo_colisiones': bool(resultado.get('hubo_colisiones')),
            'vehiculos_afectados': int(resultado.get('vehiculos_afectados')),
            'total_vehiculos': int(resultado.get('total_vehiculos')),
            'distancia_seguridad': float(resultado.get('distancia_seguridad')),
            'duracion': float(resultado.get('duracion'))
        }

        return resumen

    def run(self, seed_start: int = 0, seeds: Optional[List[int]] = None):
        """
        Ejecuta el experimento Monte Carlo.

        Args:
            seed_start: semilla inicial (si `seeds` es None se usan `range(seed_start, seed_start+num_runs)`).
            seeds: lista opcional de semillas a usar (ignora `seed_start` si provista).
        """
        self._runs = []

        if seeds is None:
            seeds_to_use = list(range(seed_start, seed_start + self.num_runs))
        else:
            seeds_to_use = list(seeds)

        for s in seeds_to_use:
            resumen = self._run_single(int(s))
            self._runs.append(resumen)

        return self._runs

    def to_dataframe(self):
        """Devuelve un `pandas.DataFrame` o None si `pandas` no está instalado."""
        if pd is None:
            return None
        return pd.DataFrame(self._runs)

    def save(self, filepath: str):
        """
        Guarda los resultados en `filepath`. Si la extensión es `.xlsx` intentará
        usar Excel vía `pandas`. Si `pandas` no está disponible o la extensión no
        es xlsx, guardará CSV como respaldo.
        """
        if not self._runs:
            raise RuntimeError('No hay resultados. Ejecute `run()` antes de guardar.')

        root, ext = os.path.splitext(filepath)
        ext = ext.lower()

        if ext in ('.xlsx',) and pd is not None:
            try:
                df = pd.DataFrame(self._runs)
                df.to_excel(filepath, index=False)
                return filepath
            except Exception as e:
                # fallback a csv
                csv_path = root + '.csv'
                try:
                    df.to_csv(csv_path, index=False)
                    return csv_path
                except Exception:
                    raise
        else:
            # CSV fallback
            try:
                if pd is not None:
                    df = pd.DataFrame(self._runs)
                    df.to_csv(filepath if ext == '.csv' else root + '.csv', index=False)
                    return filepath if ext == '.csv' else root + '.csv'
                else:
                    # escribir CSV manualmente
                    import csv
                    csv_path = root + '.csv'
                    keys = list(self._runs[0].keys())
                    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                        writer = csv.DictWriter(f, fieldnames=keys)
                        writer.writeheader()
                        writer.writerows(self._runs)
                    return csv_path
            except Exception:
                raise

    def summary_statistics(self):
        """Calcula estadísticas básicas sobre las corridas.

        Retorna un diccionario con conteo de colisiones, promedio y desviación de
        vehículos afectados.
        """
        if not self._runs:
            return {}

        if pd is not None:
            df = pd.DataFrame(self._runs)
            resumen = {
                'num_corridas': len(df),
                'colisiones_total': int(df['hubo_colisiones'].sum()),
                'colisiones_frac': float(df['hubo_colisiones'].mean()),
                'vehiculos_afectados_mean': float(df['vehiculos_afectados'].mean()),
                'vehiculos_afectados_std': float(df['vehiculos_afectados'].std(ddof=0))
            }
            return resumen
        else:
            # cálculo manual
            total = len(self._runs)
            colisiones = sum(1 for r in self._runs if r.get('hubo_colisiones'))
            affected = [r.get('vehiculos_afectados', 0) for r in self._runs]
            mean_aff = sum(affected) / total
            var = sum((x - mean_aff) ** 2 for x in affected) / total
            return {
                'num_corridas': total,
                'colisiones_total': colisiones,
                'colisiones_frac': colisiones / total,
                'vehiculos_afectados_mean': mean_aff,
                'vehiculos_afectados_std': math.sqrt(var)
            }