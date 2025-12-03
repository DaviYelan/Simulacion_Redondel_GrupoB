
import React, { useState } from 'react';
import { Controls } from './components/Controls';
import { SimulationCanvas } from './components/SimulationCanvas';
import { SimulationConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';

function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(true);
  const [jamSignal, setJamSignal] = useState(0);
  const [jamActive, setJamActive] = useState(false);
  const [stats, setStats] = useState({ avgSpeed: 0, brakingCount: 0 });
  const [speedHistory, setSpeedHistory] = useState<{time: number, value: number}[]>([]);
  const [resetKey, setResetKey] = useState(0); // Key to force re-mount of simulation

  // Update history for chart
  React.useEffect(() => {
    if(!isRunning) return;
    
    setSpeedHistory(prev => {
        // Normalize speed to percentage (0-100 based on maxSpeed)
        const percentage = Math.min(100, (stats.avgSpeed / (config.maxSpeed * 100)) * 100);
        
        const newHistory = [...prev, { time: Date.now(), value: percentage }];
        if(newHistory.length > 60) newHistory.shift();
        return newHistory;
    });
  }, [stats, isRunning, config.maxSpeed]);

  const handleTriggerJam = () => {
    setJamActive(true);
    setJamSignal(s => s + 1);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG); 
    setIsRunning(true);
    setJamActive(false);
    setJamSignal(0);
    setSpeedHistory([]);
    setResetKey(prev => prev + 1); // This forces the SimulationCanvas to completely unmount and remount
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Simulador de Tráfico Circular
            </h1>
          </div>
          <a href="https://es.wikipedia.org/wiki/Onda_de_tr%C3%A1fico" target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:flex items-center gap-2">
            <span>¿Qué es esto?</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-6">
        
        {/* Top Section: Simulation Canvas */}
        <div className="w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px]">
          
          <SimulationCanvas 
            key={resetKey} // Force reset when this changes
            config={config} 
            isRunning={isRunning}
            triggerJamSignal={jamSignal}
            onJamComplete={() => setJamActive(false)}
            setStats={setStats}
          />
          
          {/* Overlay Stats */}
          <div className="absolute top-4 right-4 md:right-8 flex flex-col gap-2 pointer-events-none">
             <div className="bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Velocidad Promedio</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">
                  {stats.avgSpeed.toFixed(1)}
                  <span className="text-xs text-slate-500 ml-1">rad/s</span>
                </div>
             </div>
             
             <div className="bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-xl shadow-lg flex items-center gap-3">
                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Autos Frenando</div>
                <div className={`text-2xl font-mono font-bold transition-colors ${stats.brakingCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {stats.brakingCount}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Section: Dashboard Grid (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Left Column: Controls */}
            <div className="h-full">
                <Controls 
                    config={config} 
                    setConfig={setConfig}
                    isRunning={isRunning}
                    setIsRunning={setIsRunning}
                    onReset={handleReset}
                    onTriggerJam={handleTriggerJam}
                    jamActive={jamActive}
                />
            </div>

            {/* Right Column: Chart */}
            <div className="h-full flex flex-col gap-6">
                
                {/* Advanced Chart */}
                <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-5 flex-1 min-h-[350px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Eficiencia del Flujo
                            </h3>
                            <p className="text-xs text-slate-400">vs. Velocidad Máxima Posible</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Actual
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={speedHistory}>
                                <defs>
                                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis 
                                    domain={[0, 110]} 
                                    tick={{fill: '#94a3b8', fontSize: 12}} 
                                    tickFormatter={(val) => `${val}%`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0', borderRadius: '8px' }}
                                    itemStyle={{ color: '#22d3ee' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Eficiencia']}
                                    labelFormatter={() => ''}
                                />
                                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Óptimo', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#22d3ee" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorSpeed)" 
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Explanation Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="p-3 bg-slate-700 rounded-lg shrink-0">
                         <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-white block mb-1">Efecto Fantasma</strong>
                        Un frenazo leve se amplifica hacia atrás, creando ondas de detención sin causa aparente.
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
