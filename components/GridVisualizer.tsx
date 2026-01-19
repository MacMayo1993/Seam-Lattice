import React, { useMemo, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CellState, Coordinate, CellMetadata, VisualizationMode } from '../types';
import { COLORS } from '../constants';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Eye, Repeat } from 'lucide-react';

interface GridVisualizerProps {
  grid: CellState[][];
  activeCells: Coordinate[]; // Cells currently in the processing queue
  cellMetadata?: CellMetadata[][];
  visualizationMode?: VisualizationMode;
  onVisualizationModeChange?: (mode: VisualizationMode) => void;
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({
  grid,
  activeCells,
  cellMetadata,
  visualizationMode = 'default',
  onVisualizationModeChange
}) => {
  const size = grid.length;

  // Optimize active lookup
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    activeCells.forEach(c => set.add(`${c.row},${c.col}`));
    return set;
  }, [activeCells]);

  // Dynamic sizing based on grid size (mobile-responsive)
  const { maxWidth, gap, minCellSize} = useMemo(() => {
    // Mobile-first approach: smaller max widths that fit on screens
    if (size <= 15) return { maxWidth: 'min(600px, 90vw)', gap: 'gap-2', minCellSize: 32 };
    if (size <= 25) return { maxWidth: 'min(700px, 90vw)', gap: 'gap-1.5', minCellSize: 24 };
    if (size <= 35) return { maxWidth: 'min(850px, 90vw)', gap: 'gap-1', minCellSize: 20 };
    return { maxWidth: 'min(1000px, 90vw)', gap: 'gap-0.5', minCellSize: 16 };
  }, [size]);

  // Get color based on visualization mode
  const getCellColor = (row: number, col: number, cellState: CellState): string => {
    if (!cellMetadata || visualizationMode === 'default') {
      return cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
    }

    const metadata = cellMetadata[row][col];

    if (visualizationMode === 'wave-pattern' || visualizationMode === 'generation') {
      // Color by generation
      const gen = metadata.generation;
      if (gen === -1) {
        // Not flipped yet
        return cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
      }

      // Wave pattern colors - gradient from white (gen 0) to red/blue
      const colors = [
        'bg-white', // Gen 0 - spark
        'bg-yellow-300', // Gen 1
        'bg-orange-400', // Gen 2
        'bg-rose-500', // Gen 3
        'bg-red-600', // Gen 4
        'bg-purple-600', // Gen 5+
      ];
      return colors[Math.min(gen, colors.length - 1)];
    }

    if (visualizationMode === 'time-heatmap') {
      // Color by time since flip
      const flipped = metadata.flippedAtStep;
      if (flipped === -1) {
        return 'bg-zinc-800'; // Never flipped
      }
      // Fade from bright to dark based on time
      const heatColors = [
        'bg-cyan-300',
        'bg-cyan-500',
        'bg-blue-500',
        'bg-indigo-600',
        'bg-purple-700',
        'bg-zinc-700'
      ];
      // Map flippedAtStep to heat level (more recent = brighter)
      return heatColors[Math.min(Math.floor(flipped / 10), heatColors.length - 1)];
    }

    return cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
  };

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={3}
      centerOnInit
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          {/* Zoom Controls - Compact horizontal bar above lattice */}
          <div className="flex gap-2 mb-3 justify-center items-center flex-wrap">
            <button
              onClick={() => zoomIn()}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 rounded-lg transition-all border border-zinc-700 text-xs"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} />
              <span>Zoom In</span>
            </button>
            <button
              onClick={() => zoomOut()}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 rounded-lg transition-all border border-zinc-700 text-xs"
              aria-label="Zoom out"
            >
              <ZoomOut size={14} />
              <span>Zoom Out</span>
            </button>
            <button
              onClick={() => resetTransform()}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 rounded-lg transition-all border border-zinc-700 text-xs"
              aria-label="Reset zoom"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* Toroidal Topology Badge - Inline */}
            <div className="h-6 w-px bg-zinc-700 mx-1"></div>
            <div
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg"
              title="Edges wrap around: top↔bottom, left↔right. No boundaries!"
            >
              <Repeat size={14} className="text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">Toroidal</span>
            </div>
          </div>

          <TransformComponent>
            <div
              className={`grid ${gap} p-3 sm:p-6 bg-zinc-950 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-2xl transition-all duration-500`}
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(${minCellSize}px, 1fr))`,
                aspectRatio: '1 / 1',
                maxWidth: maxWidth,
                width: '100%',
                perspective: '1200px'
              }}
            >
      {grid.map((row, rIndex) => (
        row.map((cellState, cIndex) => {
          const isActive = activeSet.has(`${rIndex},${cIndex}`);
          const colorClass = getCellColor(rIndex, cIndex, cellState);
          const isNegative = cellState === CellState.NEGATIVE;
          const metadata = cellMetadata?.[rIndex]?.[cIndex];

          // Scale effects based on grid size
          const ringSize = size > 35 ? 'ring-2' : size > 25 ? 'ring-3' : 'ring-4';
          const scaleActive = size > 35 ? 1.1 : size > 25 ? 1.15 : 1.25;
          const showInnerDot = size <= 35; // Hide dot on very large grids

          // Create tooltip content
          const tooltipContent = metadata
            ? `Cell (${rIndex}, ${cIndex})\nState: ${cellState > 0 ? 'A (+1)' : 'B (-1)'}\nGeneration: ${metadata.generation >= 0 ? metadata.generation : 'Not reached'}\nFlipped at step: ${metadata.flippedAtStep >= 0 ? metadata.flippedAtStep : 'Never'}\nFlip count: ${metadata.flipCount}`
            : `(${rIndex}, ${cIndex}) ${cellState > 0 ? '+' : '-'}`;

          return (
            <div
              key={`${rIndex}-${cIndex}`}
              className={`
                rounded-md flex items-center justify-center relative
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${colorClass}
                ${isActive
                  ? `z-20 ${ringSize} ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.6)] animate-pulse`
                  : 'opacity-90 hover:opacity-100'
                }
              `}
              style={{
                transform: `rotateY(${isNegative && visualizationMode === 'default' ? 180 : 0}deg) scale(${isActive ? scaleActive : 1})`,
              }}
              title={tooltipContent}
              role="gridcell"
              aria-label={`Cell ${rIndex},${cIndex} - State ${cellState > 0 ? 'A' : 'B'}${isActive ? ' - Active' : ''}`}
            >
              {/* Glow effect for active cells */}
              {isActive && (
                <div className="absolute inset-0 rounded-md bg-white/20 animate-ping" />
              )}
              {/* Inner dot for texture - only show on smaller grids */}
              {showInnerDot && (
                <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10 relative z-10" />
              )}
            </div>
          );
        })
      ))}
            </div>
          </TransformComponent>

          {/* Visualization Mode Toggle - Below lattice */}
          {onVisualizationModeChange && (
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              <button
                onClick={() => onVisualizationModeChange('default')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border text-xs font-medium ${
                  visualizationMode === 'default'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Eye size={14} />
                <span>Default</span>
              </button>
              <button
                onClick={() => onVisualizationModeChange('wave-pattern')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border text-xs font-medium ${
                  visualizationMode === 'wave-pattern'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Layers size={14} />
                <span>Wave Pattern</span>
              </button>
              <button
                onClick={() => onVisualizationModeChange('time-heatmap')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border text-xs font-medium ${
                  visualizationMode === 'time-heatmap'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Layers size={14} />
                <span>Time Heatmap</span>
              </button>
            </div>
          )}
        </>
      )}
    </TransformWrapper>
  );
};