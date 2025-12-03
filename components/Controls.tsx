
import React from 'react';
import { SimulationConfig } from '../types';

interface ControlsProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  onReset: () => void;
  onTriggerJam: () => void;
  jamActive: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  config,
  setConfig,
  isRunning,
  setIsRunning,
  onReset,
  onTriggerJam,
  jamActive,
}) => {
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 w-full h-full">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-2">
          Panel de Control
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg ${isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'}`}
          >
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold transition-all border border-slate-600 hover:border-slate-500 flex items-center gap-2"
          >
            Reiniciar
          </button>
        </div>

        <button
          onClick={onTriggerJam}
          disabled={jamActive || !isRunning}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all transform active:scale-[0.98] border flex items-center justify-center gap-3 ${
            jamActive
              ? 'bg-red-900/20 text-red-500/50 cursor-not-allowed border-red-900/20'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 border-red-500/50'
          }`}
        >
          <span className="text-lg">🛑</span>
          <span className="text-sm sm:text-base font-bold">PROVOCAR ATASCO</span>
        </button>

        <p className="text-sm text-slate-400">Detiene un auto al azar por 2 segundos.</p>
      </div>

      <div className="space-y-6 pt-4 border-t border-slate-700/50">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 flex justify-between items-center">
            <span>Cantidad de Autos</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded text-slate-200 font-mono text-xs">{config.carCount}</span>
          </label>
          <input
            type="range"
            min="2"
            max="40"
            value={config.carCount}
            onChange={(e) => {
              handleChange('carCount', Number.parseInt(e.target.value));
            }}
            className="w-full accent-slate-600 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer hover:bg-slate-950 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 flex justify-between items-center">
            <span>Velocidad Objetivo</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded text-slate-200 font-mono text-xs">{(config.maxSpeed * 100).toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.005"
            max="0.05"
            step="0.001"
            value={config.maxSpeed}
            onChange={(e) => handleChange('maxSpeed', Number.parseFloat(e.target.value))}
            className="w-full accent-slate-600 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer hover:bg-slate-950 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300 flex justify-between items-center">
            <span>Distancia Segura</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded text-slate-200 font-mono text-xs">{config.safeDistance.toFixed(2).replace('.', ',')} rad</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.safeDistance}
            onChange={(e) => handleChange('safeDistance', Number.parseFloat(e.target.value))}
            className="w-full accent-slate-600 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer hover:bg-slate-950 transition-colors"
          />
        </div>
      </div>
      <div className="mt-auto pt-6 border-t border-slate-700 text-xs font-medium text-slate-500">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <div className="text-slate-300">Frenando <span className="text-slate-500">(Luces encendidas)</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <div className="text-slate-300">Circulando</div>
          </div>
        </div>
      </div>
    </div>
  );
};
