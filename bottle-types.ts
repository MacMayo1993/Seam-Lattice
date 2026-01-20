// Bottle Mode Types

export type Regime = -1 | 0 | 1; // -1 unclaimed, 0=A Frozen, 1=B Liquid

export type SpawnPreset = 'capVsBase' | 'leftVsRight' | 'neckVsBody' | 'frozenStart' | 'liquidStart' | 'custom';

export interface BottleParams {
  nx: number;
  ny: number;
  threshold: number;      // τ in [0.6..1.0] - consensus threshold
  hysteresis: number;     // e.g., 0.05 meaning 95% switch, 90% revert
  biasA: number;          // additive strength for Frozen
  biasB: number;          // additive strength for Liquid
  speedA: number;         // steps per frame for Frozen front
  speedB: number;         // steps per frame for Liquid front
  seed: number;
  spawn: SpawnPreset;
}

export interface BottleState {
  regime: Int8Array;      // length nx*ny - cell regime
  strA: Float32Array;     // strength of A (Frozen) at each cell
  strB: Float32Array;     // strength of B (Liquid) at each cell
  mask: Uint8Array;       // 0/1 active cell mask
  fracA: number;          // fraction of cells with A
  fracB: number;          // fraction of cells with B
  global: Regime;         // current global regime
  activeCells: number;    // total active cells in mask
  queueA: number[];       // BFS queue for A front (flat indices)
  queueB: number[];       // BFS queue for B front (flat indices)
  step: number;           // current simulation step
  switchFrame: number;    // frame when global switch occurred (-1 if not yet)
}

export interface BottleAnimState {
  transitioning: boolean;
  transitionProgress: number; // 0-1
  fromRegime: Regime;
  toRegime: Regime;
  particles: Particle[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'sparkle' | 'bubble' | 'frost';
}

// Default parameters
export const DEFAULT_BOTTLE_PARAMS: BottleParams = {
  nx: 150,
  ny: 200,
  threshold: 1.0,
  hysteresis: 0.05,
  biasA: 0.1,
  biasB: 0.1,
  speedA: 3,
  speedB: 3,
  seed: 42,
  spawn: 'capVsBase',
};

// Preset configurations for different stories
export const BOTTLE_PRESETS: Record<string, Partial<BottleParams> & { name: string; description: string }> = {
  capVsBase: {
    name: 'Cap vs Base',
    description: 'Cold (Frozen) descends from cap; Warm (Liquid) rises from base',
    spawn: 'capVsBase',
    biasA: 0.15,
    biasB: 0.1,
    speedA: 3,
    speedB: 2,
  },
  leftVsRight: {
    name: 'Sun vs Shade',
    description: 'Heat (Liquid) from sunlit left side; Cold (Frozen) from shaded right',
    spawn: 'leftVsRight',
    biasA: 0.1,
    biasB: 0.15,
    speedA: 2,
    speedB: 3,
  },
  neckVsBody: {
    name: 'Neck Bottleneck',
    description: 'Narrow neck influences propagation - watch the chokepoint',
    spawn: 'neckVsBody',
    biasA: 0.12,
    biasB: 0.12,
    speedA: 3,
    speedB: 3,
  },
  balanced: {
    name: 'Balanced Race',
    description: 'Equal forces compete - outcome depends on random fluctuations',
    spawn: 'capVsBase',
    biasA: 0.1,
    biasB: 0.1,
    speedA: 3,
    speedB: 3,
  },
  frozenWins: {
    name: 'Freeze Dominant',
    description: 'Strong cold front overwhelms the liquid',
    spawn: 'capVsBase',
    biasA: 0.25,
    biasB: 0.05,
    speedA: 4,
    speedB: 2,
  },
  liquidWins: {
    name: 'Heat Wave',
    description: 'Intense heat rapidly liquefies the bottle',
    spawn: 'capVsBase',
    biasA: 0.05,
    biasB: 0.25,
    speedA: 2,
    speedB: 4,
  },
  frozenStart: {
    name: 'Melt the Ice',
    description: 'Bottle starts frozen. Heat spreads from center outward.',
    spawn: 'frozenStart',
    biasA: 0.05,
    biasB: 0.15,
    speedA: 2,
    speedB: 3,
  },
  liquidStart: {
    name: 'Freeze the Water',
    description: 'Bottle starts liquid. Cold spreads from center outward.',
    spawn: 'liquidStart',
    biasA: 0.15,
    biasB: 0.05,
    speedA: 3,
    speedB: 2,
  },
};
