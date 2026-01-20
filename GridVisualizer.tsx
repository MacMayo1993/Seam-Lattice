import React, { useMemo, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { CellState, Coordinate, CellMetadata, VisualizationMode } from '../types';
import { COLORS } from '../constants';
import { ZoomIn, ZoomOut, RotateCcw, Repeat } from 'lucide-react';

interface GridVisualizerProps {
  grid: CellState[][];
  activeCells: Coordinate[];
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
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const activeSet = useMemo(() => {
    const set = new Set<string>();
    activeCells.forEach(c => set.add(`${c.row},${c.col}`));
    return set;
  }, [activeCells]);

  const { maxWidth, gap, minCellSize } = useMemo(() => {
    if (size <= 15) return { maxWidth: 'min(600px, 90vw)', gap: 'gap-2', minCellSize: 32 };
    if (size <= 25) return { maxWidth: 'min(700px, 90vw)', gap: 'gap-1.5', minCellSize: 24 };
    if (size <= 35) return { maxWidth: 'min(850px, 90vw)', gap: 'gap-1', minCellSize: 20 };
    return { maxWidth: 'min(1000px, 90vw)', gap: 'gap-0.5', minCellSize: 16 };
  }, [size]);

  const getCellColor = (row: number, col: number, cellState: CellState): string => {
    if (!cellMetadata || visualizationMode === 'default') {
      return cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
    }

    const metadata = cellMetadata[row][col];

    if (visualizationMode === 'wave-pattern' || visualizationMode === 'generation') {
      const gen = metadata.generation;
      if (gen === -1) {
        return cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
      }
      const colors = [
        'bg-white',
        'bg-yellow-300',
        'bg-orange-400',
        'bg-rose-500',
        'bg-red-600',
        'bg-purple-600',
      ];
      return colors[Math.min(gen, colors.length - 1)];
    }

    if (visualizationMode === 'time-heatmap') {
      const flipped = metadata.flippedAtStep;
      if (flipped === -1) {
        return 'bg-zinc-800';
      }
      const heatColors = [
        'bg-cyan-300',
        'bg-cyan-500',
        'bg-blue-500',
        'bg-indigo-600',
        'bg-purple-700',
        'bg-zinc-700'
      ];
      return heatColors[Math.min(Math.floor(flipped / 10), heatColors.length - 1)];
    }

    return cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
  };

  const handleZoomIn = () => transformRef.current?.zoomIn();
  const handleZoomOut = () => transformRef.current?.zoomOut();
  const handleReset = () => transformRef.current?.resetTransform();

  return (
    <div className="flex flex-col items-center w-full">
      {/* Zoom Controls - ABOVE lattice */}
      <div className="flex gap-1 mb-2 justify-center items-center">
        <button
          onClick={handleZoomOut}
          className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-all"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-all"
          title="Reset View"
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-all"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
        <div
          className="flex items-center gap-1 px-2 py-1 bg-purple-600/10 border border-purple-500/20 rounded text-purple-400"
          title="Toroidal: edges wrap around"
        >
          <Repeat size={12} />
          <span className="text-[10px] font-medium">Torus</span>
        </div>
      </div>

      {/* Lattice Grid with zoom/pan */}
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
      >
        <TransformComponent>
          <div
            className={`grid ${gap} p-3 sm:p-4 bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl`}
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(${minCellSize}px, 1fr))`,
              aspectRatio: '1 / 1',
              maxWidth: maxWidth,
              width: '100%',
            }}
          >
            {grid.map((row, rIndex) =>
              row.map((cellState, cIndex) => {
                const isActive = activeSet.has(`${rIndex},${cIndex}`);
                const colorClass = getCellColor(rIndex, cIndex, cellState);
                const isNegative = cellState === CellState.NEGATIVE;
                const metadata = cellMetadata?.[rIndex]?.[cIndex];

                const ringSize = size > 35 ? 'ring-2' : size > 25 ? 'ring-3' : 'ring-4';
                const scaleActive = size > 35 ? 1.1 : size > 25 ? 1.15 : 1.25;
                const showInnerDot = size <= 35;

                const tooltipContent = metadata
                  ? `(${rIndex},${cIndex}) Gen:${metadata.generation >= 0 ? metadata.generation : '-'}`
                  : `(${rIndex},${cIndex})`;

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
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-md bg-white/20 animate-ping" />
                    )}
                    {showInnerDot && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10 relative z-10" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* View Mode Toggle - BELOW lattice */}
      {onVisualizationModeChange && (
        <div className="flex gap-1 mt-2 justify-center items-center">
          <span className="text-[10px] text-zinc-500 mr-1">View:</span>
          <button
            onClick={() => onVisualizationModeChange('default')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
              visualizationMode === 'default'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => onVisualizationModeChange('wave-pattern')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
              visualizationMode === 'wave-pattern'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            Wave
          </button>
          <button
            onClick={() => onVisualizationModeChange('time-heatmap')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
              visualizationMode === 'time-heatmap'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            Heat
          </button>
        </div>
      )}
    </div>
  );
};
