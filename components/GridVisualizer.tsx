import React, { useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CellState, Coordinate } from '../types';
import { COLORS } from '../constants';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GridVisualizerProps {
  grid: CellState[][];
  activeCells: Coordinate[]; // Cells currently in the processing queue
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ grid, activeCells }) => {
  const size = grid.length;

  // Optimize active lookup
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    activeCells.forEach(c => set.add(`${c.row},${c.col}`));
    return set;
  }, [activeCells]);

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={3}
      centerOnInit
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <>
          {/* Zoom Controls */}
          <div className="flex gap-2 mb-4 justify-center">
            <button
              onClick={() => zoomIn()}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700"
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
              Zoom In
            </button>
            <button
              onClick={() => zoomOut()}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700"
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
              Zoom Out
            </button>
            <button
              onClick={() => resetTransform()}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700"
              aria-label="Reset zoom"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          <TransformComponent>
            <div
              className="grid gap-2 p-6 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl transition-all duration-500"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                aspectRatio: '1 / 1',
                maxWidth: '700px',
                width: '100%',
                perspective: '1200px'
              }}
            >
      {grid.map((row, rIndex) => (
        row.map((cellState, cIndex) => {
          const isActive = activeSet.has(`${rIndex},${cIndex}`);
          const colorClass = cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
          const isNegative = cellState === CellState.NEGATIVE;
          
          return (
            <div
              key={`${rIndex}-${cIndex}`}
              className={`
                rounded-md flex items-center justify-center relative
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${colorClass}
                ${isActive
                  ? 'z-20 ring-4 ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.6)] animate-pulse'
                  : 'opacity-90 hover:opacity-100'
                }
              `}
              style={{
                transform: `rotateY(${isNegative ? 180 : 0}deg) scale(${isActive ? 1.25 : 1})`,
              }}
              title={`(${rIndex}, ${cIndex}) ${cellState > 0 ? '+' : '-'}`}
              role="gridcell"
              aria-label={`Cell ${rIndex},${cIndex} - State ${cellState > 0 ? 'A' : 'B'}${isActive ? ' - Active' : ''}`}
            >
              {/* Glow effect for active cells */}
              {isActive && (
                <div className="absolute inset-0 rounded-md bg-white/20 animate-ping" />
              )}
              {/* Inner dot for texture */}
              <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10 relative z-10" />
            </div>
          );
        })
      ))}
            </div>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
};