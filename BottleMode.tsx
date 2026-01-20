// Bottle Mode - React Component

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Snowflake, Droplets, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BottleParams,
  BottleState,
  DEFAULT_BOTTLE_PARAMS,
  BOTTLE_PRESETS,
  Regime,
} from './bottle-types';
import { initBottleState, stepBottleSim, createRng, isSimulationComplete, getWinnerName } from './bottle-sim';
import { renderBottle, drawProgressRing } from './bottle-renderer';
import { createAnimState, updateAnimState, triggerTransition, getRegimeStatus, spawnBurst } from './bottle-anim';

interface BottleModeProps {
  onBack?: () => void;
}

export const BottleMode: React.FC<BottleModeProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<BottleParams>(DEFAULT_BOTTLE_PARAMS);
  const [state, setState] = useState<BottleState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const stateRef = useRef<BottleState | null>(null);
  const animStateRef = useRef(createAnimState());
  const rngRef = useRef(createRng(params.seed));
  const lastTimeRef = useRef(0);
  const frameIdRef = useRef<number>(0);

  const scale = 3; // Render scale

  // Initialize simulation
  const initSim = useCallback(() => {
    const newState = initBottleState(params);
    setState(newState);
    stateRef.current = newState;
    animStateRef.current = createAnimState();
    rngRef.current = createRng(params.seed);
    setIsRunning(false);
  }, [params]);

  // Initialize on mount and param changes
  useEffect(() => {
    initSim();
  }, [initSim]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !stateRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const { nx, ny } = params;

    canvas.width = nx * scale;
    canvas.height = ny * scale;

    const animate = (time: number) => {
      const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      if (stateRef.current) {
        // Step simulation if running
        if (isRunning && !isSimulationComplete(stateRef.current)) {
          const prevGlobal = stateRef.current.global;
          const { changed, newGlobal } = stepBottleSim(stateRef.current, params, rngRef.current);

          if (changed && newGlobal !== -1) {
            triggerTransition(animStateRef.current, prevGlobal, newGlobal);
            // Spawn burst at center
            spawnBurst(animStateRef.current, nx / 2, ny / 2, 30, newGlobal === 0 ? 'frost' : 'bubble');
          }

          setState({ ...stateRef.current });
        }

        // Update animations
        updateAnimState(animStateRef.current, stateRef.current, nx, ny, deltaTime);

        // Render
        renderBottle(ctx, stateRef.current, nx, ny, animStateRef.current, scale);

        // Draw progress ring
        const ringX = canvas.width - 50;
        const ringY = 50;
        drawProgressRing(
          ctx,
          ringX,
          ringY,
          30,
          stateRef.current.fracA,
          stateRef.current.fracB,
          stateRef.current.global
        );
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [isRunning, params]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsRunning(r => !r);
      } else if (e.key === 'r' || e.key === 'R') {
        initSim();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initSim]);

  const handlePresetChange = (presetKey: string) => {
    const preset = BOTTLE_PRESETS[presetKey];
    if (preset) {
      setParams(prev => ({ ...prev, ...preset, spawn: preset.spawn || prev.spawn }));
    }
  };

  const updateParam = (key: keyof BottleParams, value: number | string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const statusMessage = state ? getRegimeStatus(state.global, state.fracA, state.fracB, state.switchFrame) : '';
  const winner = state ? getWinnerName(state) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-screen bg-zinc-950 text-zinc-100">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Status Banner - only show dramatic colors after a switch */}
        <div className={`mb-4 px-6 py-3 rounded-lg font-bold text-lg flex items-center gap-3 transition-all ${
          state?.switchFrame !== -1 && state?.global === 0 ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300' :
          state?.switchFrame !== -1 && state?.global === 1 ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-300' :
          'bg-zinc-800/50 border border-zinc-700 text-zinc-300'
        }`}>
          {state?.switchFrame !== -1 && state?.global === 0 && <Snowflake className="animate-pulse" size={24} />}
          {state?.switchFrame !== -1 && state?.global === 1 && <Droplets className="animate-pulse" size={24} />}
          <span>{statusMessage}</span>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-zinc-800 shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl animate-in fade-in duration-500">
              <div className={`p-6 rounded-2xl text-center ${
                state?.global === 0 ? 'bg-blue-900/80 border-blue-500' : 'bg-cyan-900/80 border-cyan-500'
              } border-2`}>
                <div className="text-4xl font-black mb-2">
                  {state?.global === 0 ? '❄️ FROZEN' : '💧 LIQUID'}
                </div>
                <div className="text-lg text-zinc-300">
                  Regime switch complete in {state?.switchFrame} steps
                </div>
                <button
                  onClick={initSim}
                  className="mt-4 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={18} />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={initSim}
            className="px-4 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-medium flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-medium"
            >
              ← Back to Lattice
            </button>
          )}
        </div>

        {/* Stats */}
        {state && (
          <div className="flex gap-4 mt-4 text-sm">
            <div className="px-3 py-1 bg-blue-900/30 rounded border border-blue-500/30">
              <span className="text-blue-400">Frozen:</span>{' '}
              <span className="font-mono">{(state.fracA * 100).toFixed(1)}%</span>
            </div>
            <div className="px-3 py-1 bg-cyan-900/30 rounded border border-cyan-500/30">
              <span className="text-cyan-400">Liquid:</span>{' '}
              <span className="font-mono">{(state.fracB * 100).toFixed(1)}%</span>
            </div>
            <div className="px-3 py-1 bg-zinc-800 rounded">
              <span className="text-zinc-400">Step:</span>{' '}
              <span className="font-mono">{state.step}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Help Section */}
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full p-3 flex items-center justify-between hover:bg-amber-900/10"
          >
            <span className="flex items-center gap-2 font-bold text-amber-400">
              <HelpCircle size={18} />
              How It Works
            </span>
            {showHelp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showHelp && (
            <div className="p-4 pt-0 text-sm text-amber-200/80 space-y-2">
              <p>
                <strong>The Concept:</strong> A bottle can be either <span className="text-blue-400">Frozen</span> or{' '}
                <span className="text-cyan-400">Liquid</span> — no in-between.
              </p>
              <p>
                Watch as local interactions spread from spawn points. When enough cells agree (reach the threshold),
                the <em>entire bottle</em> switches regime — a <strong>global state transition</strong>.
              </p>
              <p className="text-amber-300 font-medium">
                "When enough local cells agree, the whole bottle switches."
              </p>
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-zinc-200">Scenario Presets</h3>
          <select
            value={params.spawn}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm"
          >
            {Object.entries(BOTTLE_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">
            {BOTTLE_PRESETS[params.spawn]?.description}
          </p>
        </div>

        {/* Parameters */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-4">
          <h3 className="font-bold text-zinc-200">Parameters</h3>

          {/* Threshold */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="text-zinc-400">Consensus Threshold (τ)</label>
              <span className="font-mono text-zinc-300">{params.threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1"
              step="0.05"
              value={params.threshold}
              onChange={(e) => updateParam('threshold', parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Speeds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-blue-400">Frozen Speed</label>
              <input
                type="range"
                min="1"
                max="6"
                value={params.speedA}
                onChange={(e) => updateParam('speedA', parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-cyan-400">Liquid Speed</label>
              <input
                type="range"
                min="1"
                max="6"
                value={params.speedB}
                onChange={(e) => updateParam('speedB', parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* Biases */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-blue-400">Frozen Bias</label>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={params.biasA}
                onChange={(e) => updateParam('biasA', parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-cyan-400">Liquid Bias</label>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={params.biasB}
                onChange={(e) => updateParam('biasB', parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* Seed */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label className="text-zinc-400">Random Seed</label>
              <span className="font-mono text-zinc-300">{params.seed}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={params.seed}
                onChange={(e) => updateParam('seed', parseInt(e.target.value) || 0)}
                className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-sm"
              />
              <button
                onClick={() => updateParam('seed', Math.floor(Math.random() * 10000))}
                className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs"
              >
                Random
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-zinc-500 space-y-1">
          <div><kbd className="px-1 bg-zinc-800 rounded">Space</kbd> Play/Pause</div>
          <div><kbd className="px-1 bg-zinc-800 rounded">R</kbd> Reset</div>
        </div>
      </div>
    </div>
  );
};

export default BottleMode;
