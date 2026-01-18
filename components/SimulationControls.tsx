import React from 'react';
import { Play, Pause, RefreshCw, Zap, Settings2, Shuffle, HelpCircle, SkipForward } from 'lucide-react';
import { SimulationConfig } from '../types';
import { K_STAR } from '../constants';

interface ControlsProps {
  config: SimulationConfig;
  isRunning: boolean;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onToggleRun: () => void;
  onReset: () => void;
  onIgnite: () => void;
  onRandomize?: () => void;
  onStepForward?: () => void;
}

export const SimulationControls: React.FC<ControlsProps> = ({
  config,
  isRunning,
  onUpdateConfig,
  onToggleRun,
  onReset,
  onIgnite,
  onRandomize,
  onStepForward
}) => {
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);

  const handleSpeedChange = (multiplier: number) => {
    setPlaybackSpeed(multiplier);
    // Adjust delay inversely (lower delay = faster)
    const baseDelay = 100;
    onUpdateConfig({ delay: baseDelay / multiplier });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-100 font-bold flex items-center gap-2">
          <Settings2 size={18} />
          <span>Lattice Parameters</span>
        </h3>
        <span className="text-xs font-mono text-zinc-500">v0.9.0-alpha</span>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggleRun}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
            isRunning
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
          aria-label={isRunning ? 'Pause simulation' : 'Resume simulation'}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={onIgnite}
          disabled={isRunning}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Ignite seam at center"
        >
          <Zap size={18} />
          Ignite
        </button>

        <button
          onClick={onReset}
          className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700"
          title="Reset Grid"
          aria-label="Reset grid"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        {onStepForward && (
          <button
            onClick={onStepForward}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            aria-label="Step forward one tick"
          >
            <SkipForward size={16} />
            Step
          </button>
        )}
        {onRandomize && (
          <button
            onClick={onRandomize}
            disabled={isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            aria-label="Randomize grid state"
          >
            <Shuffle size={16} />
            Randomize
          </button>
        )}
      </div>

      {/* Playback Speed */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm items-center">
          <label className="text-zinc-400">Playback Speed</label>
          <span className="font-mono text-zinc-200">{playbackSpeed}x</span>
        </div>
        <div className="flex gap-1">
          {[0.25, 0.5, 1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                playbackSpeed === speed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              aria-label={`Set speed to ${speed}x`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Grid Size Slider with Input */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <label className="text-zinc-400 flex items-center gap-1">
              Grid Size (N×N)
              <div className="group relative">
                <HelpCircle size={14} className="text-zinc-600 hover:text-zinc-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 z-50">
                  Determines the lattice dimensions. Larger grids show more complex patterns.
                </div>
              </div>
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={config.gridSize}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 5;
                // Keep it odd for perfect center
                const oddVal = val % 2 === 0 ? val + 1 : val;
                onUpdateConfig({ gridSize: Math.min(50, Math.max(5, oddVal)) });
              }}
              className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Grid size value"
            />
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="2"
            value={config.gridSize}
            onChange={(e) => onUpdateConfig({ gridSize: parseInt(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            aria-label="Grid size slider"
          />
        </div>

        {/* Propagation Bias with Input */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <label className="text-zinc-400 flex items-center gap-1">
              Propagation Bias
              <div className="group relative">
                <HelpCircle size={14} className="text-zinc-600 hover:text-zinc-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 z-50">
                  Adjusts k* threshold. Higher values lead to faster, more aggressive cascading propagation.
                </div>
              </div>
            </label>
            <input
              type="number"
              min="0"
              max="0.6"
              step="0.01"
              value={config.propagationBias}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onUpdateConfig({ propagationBias: Math.min(0.6, Math.max(0, val)) });
              }}
              className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Propagation bias value"
            />
          </div>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.01"
            value={config.propagationBias}
            onChange={(e) => onUpdateConfig({ propagationBias: parseFloat(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            aria-label="Propagation bias slider"
          />
          <p className="text-xs text-zinc-500">
            Applied to k* ({K_STAR.toFixed(3)}). Effective threshold: {(K_STAR - config.propagationBias).toFixed(3)}
          </p>
        </div>

        {/* Tick Delay with Input */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <label className="text-zinc-400 flex items-center gap-1">
              Tick Delay
              <div className="group relative">
                <HelpCircle size={14} className="text-zinc-600 hover:text-zinc-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 z-50">
                  Time between simulation steps in milliseconds. Lower = faster animation.
                </div>
              </div>
            </label>
            <input
              type="number"
              min="10"
              max="500"
              step="10"
              value={config.delay}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 10;
                onUpdateConfig({ delay: Math.min(500, Math.max(10, val)) });
              }}
              className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Tick delay value"
            />
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={config.delay}
            onChange={(e) => onUpdateConfig({ delay: parseInt(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            aria-label="Tick delay slider"
          />
        </div>
      </div>
    </div>
  );
};