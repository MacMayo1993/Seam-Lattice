import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Zap, Sun, Moon, Menu, X, PanelLeftClose, PanelLeft, Beaker, Grid3X3 } from 'lucide-react';
import {
  createGrid,
  getNeighbors,
  checkAnnihilation,
  calculateCoherence,
  randomizeGrid
} from './utils/latticeLogic';
import {
  CellState,
  Coordinate,
  SimulationConfig,
  SimulationStats,
  CellMetadata,
  VisualizationMode
} from './types';
import {
  K_STAR,
  DEFAULT_GRID_SIZE,
  DEFAULT_BIAS,
  ANIMATION_SPEED_MS
} from './constants';
import { GridVisualizer } from './components/GridVisualizer';
import { SimulationControls } from './components/SimulationControls';
import { InfoPanel } from './components/InfoPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { BottleMode } from './modes/bottle/BottleMode';

type AppMode = 'lattice' | 'bottle';

const App: React.FC = () => {
  // --- Mode State ---
  const [appMode, setAppMode] = useState<AppMode>('lattice');

  // --- Lattice State ---
  const [config, setConfig] = useState<SimulationConfig>({
    gridSize: DEFAULT_GRID_SIZE,
    thresholdK: K_STAR,
    propagationBias: DEFAULT_BIAS,
    delay: ANIMATION_SPEED_MS,
  });

  const [grid, setGrid] = useState<CellState[][]>(createGrid(DEFAULT_GRID_SIZE));
  const [queue, setQueue] = useState<Coordinate[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    steps: 0,
    coherence: 1,
    activeSeams: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [annihilated, setAnnihilated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('default');
  const [cellMetadata, setCellMetadata] = useState<CellMetadata[][]>(() =>
    createGrid(DEFAULT_GRID_SIZE).map(row =>
      row.map(() => ({ flippedAtStep: -1, generation: -1, flipCount: 0 }))
    )
  );

  // Refs for animation loop stability
  const queueRef = useRef<Coordinate[]>([]);
  const queueSetRef = useRef<Set<string>>(new Set()); // Track cells in queue for O(1) lookup
  const gridRef = useRef<CellState[][]>(grid);
  const configRef = useRef(config);
  const metadataRef = useRef<CellMetadata[][]>(cellMetadata);
  const generationMapRef = useRef<Map<string, number>>(new Map()); // Track generation per cell
  const stepsRef = useRef(0); // Use ref to avoid recreating stepSimulation

  // Sync refs
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { stepsRef.current = stats.steps; }, [stats.steps]);

  // --- Logic ---

  // Reset Logic - accepts optional size override to avoid stale closure issues
  const resetWithSize = useCallback((sizeOverride?: number) => {
    const size = sizeOverride ?? configRef.current.gridSize;
    setIsRunning(false);
    setAnnihilated(false);
    const newGrid = createGrid(size);
    setGrid(newGrid);
    gridRef.current = newGrid;
    setQueue([]);
    queueRef.current = [];
    queueSetRef.current = new Set();
    stepsRef.current = 0;
    const newMetadata = newGrid.map(row =>
      row.map(() => ({ flippedAtStep: -1, generation: -1, flipCount: 0 }))
    );
    setCellMetadata(newMetadata);
    metadataRef.current = newMetadata;
    setStats({ steps: 0, coherence: 1, activeSeams: 0 });
  }, []);

  // Wrapper for external calls that don't pass size
  const handleReset = useCallback(() => {
    resetWithSize(configRef.current.gridSize);
  }, [resetWithSize]);

  // Ignite Logic (Start Cascade)
  const handleIgnite = useCallback(() => {
    const size = configRef.current.gridSize;
    resetWithSize(size);

    // Start from center - use setTimeout to ensure state is updated
    setTimeout(() => {
      const center = Math.floor(size / 2);
      const startNode: Coordinate = { row: center, col: center };

      // Initialize generation tracking
      generationMapRef.current = new Map();
      generationMapRef.current.set(`${startNode.row},${startNode.col}`, 0);

      setQueue([startNode]);
      queueRef.current = [startNode];
      queueSetRef.current = new Set([`${startNode.row},${startNode.col}`]);
      setIsRunning(true);
    }, 0);
  }, [resetWithSize]);

  // Randomize Grid
  const handleRandomize = useCallback(() => {
    const size = configRef.current.gridSize;
    setIsRunning(false);
    setAnnihilated(false);
    const newGrid = randomizeGrid(size);
    setGrid(newGrid);
    gridRef.current = newGrid;
    setQueue([]);
    queueRef.current = [];
    queueSetRef.current = new Set();
    stepsRef.current = 0;
    setStats({
      steps: 0,
      coherence: calculateCoherence(newGrid),
      activeSeams: 0
    });
  }, []);

  // Simulation Step - uses refs to avoid recreating on every step
  const stepSimulation = useCallback(() => {
    const currentQueue = queueRef.current;

    if (currentQueue.length === 0) {
      setIsRunning(false);
      // Check annihilation
      if (checkAnnihilation(gridRef.current)) {
        setAnnihilated(true);
      }
      return;
    }

    // Process 1 item per tick for clear propagation visualization
    const [currentNode, ...remainingQueue] = currentQueue;
    const { row, col } = currentNode;
    const currentKey = `${row},${col}`;

    // Remove current node from the set
    queueSetRef.current.delete(currentKey);

    // Get current generation of this cell
    const currentGeneration = generationMapRef.current.get(currentKey) || 0;

    // Mutate copy of grid
    const newGrid = gridRef.current.map(r => [...r]);
    const oldVal = newGrid[row][col];

    // Flip self
    newGrid[row][col] *= -1;

    // Update metadata for current cell - use ref for step count
    const newMetadata = metadataRef.current.map(r => [...r]);
    const currentStep = stepsRef.current + 1;
    newMetadata[row][col] = {
      flippedAtStep: currentStep,
      generation: currentGeneration,
      flipCount: newMetadata[row][col].flipCount + 1
    };

    // Check neighbors
    const neighbors = getNeighbors(currentNode, configRef.current.gridSize);
    const newInQueue: Coordinate[] = [];

    neighbors.forEach(n => {
      // Propagation Condition:
      // If neighbor matches the OLD value (meaning it hasn't flipped yet relative to the pressure)
      // AND random entropy check passes.
      if (newGrid[n.row][n.col] === oldVal) {
        // Random check
        const kStarAdjusted = configRef.current.thresholdK - configRef.current.propagationBias;
        if (Math.random() > kStarAdjusted) {
          // Check if already in queue using Set for O(1) lookup
          const neighborKey = `${n.row},${n.col}`;

          if (!queueSetRef.current.has(neighborKey)) {
            newInQueue.push(n);
            queueSetRef.current.add(neighborKey);
            // Set generation for newly queued cell
            generationMapRef.current.set(neighborKey, currentGeneration + 1);
          }
        }
      }
    });

    // Update Refs
    gridRef.current = newGrid;
    queueRef.current = [...remainingQueue, ...newInQueue];
    metadataRef.current = newMetadata;

    // Calculate propagation velocity (cells flipped per step - rolling average)
    const propagationVelocity = newInQueue.length;
    const waveFrontWidth = queueRef.current.length;

    // Update State
    setGrid(newGrid);
    setQueue(queueRef.current);
    setCellMetadata(newMetadata);
    setStats({
      steps: currentStep,
      coherence: calculateCoherence(newGrid),
      activeSeams: queueRef.current.length,
      propagationVelocity,
      waveFrontWidth
    });

  }, []); // No dependencies - uses refs for all mutable data

  // Keep a ref to stepSimulation for stable interval callback
  const stepSimulationRef = useRef(stepSimulation);
  useEffect(() => { stepSimulationRef.current = stepSimulation; }, [stepSimulation]);

  // Step Forward (single tick)
  const handleStepForward = useCallback(() => {
    if (!isRunning) {
      stepSimulationRef.current();
    }
  }, [isRunning]);

  // Animation Loop - uses ref to avoid recreating interval
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isRunning && !annihilated) {
      intervalId = setInterval(() => {
        stepSimulationRef.current();
      }, config.delay);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, annihilated, config.delay]);

  // Reset grid when gridSize changes (but not on initial mount)
  const initialMountRef = useRef(true);
  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    // Grid size changed - reset with new size
    resetWithSize(config.gridSize);
  }, [config.gridSize, resetWithSize]);


  // Render Bottle Mode
  if (appMode === 'bottle') {
    return <BottleMode onBack={() => setAppMode('lattice')} />;
  }

  // Render Lattice Mode
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'} flex flex-col md:flex-row font-sans selection:bg-rose-500/30 transition-colors duration-300 relative`}>

      {/* Mode Switcher - Fixed top right */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setAppMode('lattice')}
          className={`p-2 rounded-lg flex items-center gap-2 transition-all ${
            appMode === 'lattice'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
          title="Lattice Mode"
        >
          <Grid3X3 size={18} />
          <span className="text-xs font-medium hidden sm:inline">Lattice</span>
        </button>
        <button
          onClick={() => setAppMode('bottle')}
          className={`p-2 rounded-lg flex items-center gap-2 transition-all ${
            appMode === 'bottle'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
          title="Bottle Mode - Regime Switch Demo"
        >
          <Beaker size={18} />
          <span className="text-xs font-medium hidden sm:inline">Bottle</span>
        </button>
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-gray-900'} shadow-2xl border ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'} transition-all hover:scale-105`}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Desktop Sidebar Toggle Button - Always visible */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={`hidden md:flex fixed top-4 z-50 p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700' : 'bg-white text-gray-900 hover:bg-gray-100'} shadow-lg border ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'} transition-all items-center gap-2`}
        style={{ left: isSidebarCollapsed ? '1rem' : '340px' }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        <span className="text-xs font-medium">{isSidebarCollapsed ? 'Show' : 'Hide'}</span>
      </button>

      {/* Left Panel: Controls & Info */}
      <div className={`
        ${isSidebarCollapsed ? 'md:w-0 md:min-w-0 md:max-w-0 md:overflow-hidden md:opacity-0' : 'md:w-[340px] md:min-w-[340px] md:max-w-[340px] md:opacity-100'}
        w-full
        ${isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-gray-200 bg-white'}
        flex flex-col h-screen overflow-y-auto custom-scrollbar z-40 shadow-2xl
        md:relative md:translate-x-0
        fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r
      `}>
        <div className="p-5 md:p-6 flex-1 flex flex-col gap-4">
          <header className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
                Seam Lattice
              </h1>
              <p className={`${isDarkMode ? 'text-zinc-500' : 'text-gray-500'} mt-1 font-mono text-xs`}>
                Non-orientable topology
              </p>
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-all border ${isDarkMode ? 'border-zinc-700' : 'border-gray-300'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>

          <SimulationControls
            config={config}
            isRunning={isRunning}
            onUpdateConfig={(c) => setConfig(prev => ({ ...prev, ...c }))}
            onToggleRun={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            onIgnite={handleIgnite}
            onRandomize={handleRandomize}
            onStepForward={handleStepForward}
          />

          <MetricsPanel stats={stats} />

          <InfoPanel />
        </div>
      </div>

      {/* Right Panel: Visualization */}
      <div className={`flex-1 flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-100'} p-6 overflow-hidden transition-colors duration-300`}>

        {/* Background Grid Decoration (Faded for focus) */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'} bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none opacity-50`} />

        {/* Main Grid */}
        <div className="relative z-0 flex flex-col items-center w-full">
            <div className="mb-8 relative w-full flex justify-center">
               <GridVisualizer
                 grid={grid}
                 activeCells={queue}
                 cellMetadata={cellMetadata}
                 visualizationMode={visualizationMode}
                 onVisualizationModeChange={setVisualizationMode}
               />
               
               {/* Center Marker Hint (Only at start) */}
               {!isRunning && stats.steps === 0 && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                    <span className="bg-zinc-950/90 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        START (p=0.5)
                    </span>
                 </div>
               )}
            </div>

            {/* Annihilation Message */}
            {annihilated && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-500">
                 <div className="bg-zinc-900 border border-emerald-500/50 p-8 rounded-2xl shadow-2xl text-center max-w-sm transform scale-110">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mb-4 animate-bounce">
                       <Zap size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Resolution Achieved</h2>
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                      The conflicting states have unified.
                      <br/>
                      <span className="text-emerald-400 font-medium">"A-ha Moment" reached.</span>
                    </p>
                    <button 
                      onClick={handleReset}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-emerald-900/20"
                    >
                      <RotateCcw size={18} />
                      Reset Lattice
                    </button>
                 </div>
              </div>
            )}
        </div>

        {/* Legend Overlay - Responsive */}
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex justify-center pointer-events-none">
          <div className={`${isDarkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-white/90 border-gray-300 text-gray-700'} backdrop-blur border rounded-full px-3 md:px-6 py-2 md:py-3 shadow-xl flex flex-col sm:flex-row items-center gap-2 sm:gap-6 pointer-events-auto transition-colors duration-300 text-xs`}>
             <div className="flex items-center gap-4 sm:gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500"></div>
                  <span className="font-medium">State A</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">State B</span>
               </div>
             </div>
             <div className={`hidden sm:block w-px h-4 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded border-2 border-white bg-rose-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Seam</span>
             </div>
          </div>
        </div>

        {/* Desktop Floating Controls - Shows when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <div className="hidden md:flex fixed top-4 right-4 z-30 gap-2 items-center">
            {/* Quick Stats */}
            <div className={`${isDarkMode ? 'bg-zinc-900/95 border-zinc-700' : 'bg-white/95 border-gray-300'} backdrop-blur border rounded-lg px-4 py-2 flex items-center gap-4 text-sm`}>
              <div className="flex items-center gap-2">
                <span className={`${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Steps:</span>
                <span className="font-mono font-bold">{stats.steps}</span>
              </div>
              <div className={`w-px h-4 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
              <div className="flex items-center gap-2">
                <span className={`${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Active:</span>
                <span className="font-mono font-bold">{stats.activeSeams}</span>
              </div>
            </div>
            {/* Control Buttons */}
            <button
              onClick={handleIgnite}
              disabled={isRunning}
              className="p-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Ignite seam"
              title="Ignite"
            >
              <Zap size={20} />
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-3 rounded-lg ${isRunning ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-white shadow-lg transition-all`}
              aria-label={isRunning ? 'Pause' : 'Play'}
              title={isRunning ? 'Pause' : 'Play'}
            >
              {isRunning ? '⏸' : '▶'}
            </button>
            <button
              onClick={handleReset}
              className={`p-3 rounded-lg ${isDarkMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-gray-300 hover:bg-gray-400'} text-white shadow-lg transition-all`}
              aria-label="Reset"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        )}

        {/* Mobile Quick Actions - Floating Action Buttons */}
        <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-3 z-30">
          <button
            onClick={() => {
              handleIgnite();
              setIsMobileMenuOpen(false);
            }}
            disabled={isRunning}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Ignite seam"
          >
            <Zap size={24} />
          </button>
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              setIsMobileMenuOpen(false);
            }}
            className={`w-14 h-14 rounded-full ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400'
                : 'bg-emerald-500 hover:bg-emerald-400'
            } text-white shadow-2xl flex items-center justify-center transition-all active:scale-95`}
            aria-label={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => {
              handleReset();
              setIsMobileMenuOpen(false);
            }}
            className={`w-14 h-14 rounded-full ${isDarkMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-gray-300 hover:bg-gray-400'} text-white shadow-2xl flex items-center justify-center transition-all active:scale-95`}
            aria-label="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;