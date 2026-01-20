// Bottle Simulation - Front expansion and consensus detection

import { BottleState, BottleParams, Regime } from './bottle-types';
import { generateBottleMask, getSpawnPoints } from './bottle-mask';

// Mulberry32 PRNG for deterministic randomness
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Initialize bottle state
 */
export function initBottleState(params: BottleParams): BottleState {
  const { nx, ny, spawn, seed } = params;
  const totalCells = nx * ny;

  // Generate mask
  const mask = generateBottleMask(nx, ny);

  // Count active cells
  let activeCells = 0;
  for (let i = 0; i < totalCells; i++) {
    if (mask[i] === 1) activeCells++;
  }

  // Initialize arrays
  const regime = new Int8Array(totalCells).fill(-1); // -1 = unclaimed
  const strA = new Float32Array(totalCells);
  const strB = new Float32Array(totalCells);

  // Get spawn points
  const { spawnA, spawnB, fillRegime } = getSpawnPoints(spawn, mask, nx, ny);

  // Initialize spawn points
  const rng = mulberry32(seed);

  const queueA: number[] = [];
  const queueB: number[] = [];

  // If fillRegime is set, pre-fill the entire bottle with that regime
  if (fillRegime !== undefined) {
    for (let i = 0; i < totalCells; i++) {
      if (mask[i] === 1) {
        regime[i] = fillRegime;
        if (fillRegime === 0) {
          strA[i] = 0.8 + rng() * 0.2; // Frozen cells start with some strength
        } else {
          strB[i] = 0.8 + rng() * 0.2; // Liquid cells start with some strength
        }
      }
    }
  }

  // Seed A spawns (frozen)
  for (const idx of spawnA) {
    if (regime[idx] === -1 || fillRegime === 1) {
      // Claim unclaimed OR convert from liquid (in liquidStart mode)
      regime[idx] = 0; // A = Frozen
      strA[idx] = 1.0 + params.biasA + rng() * 0.1;
      strB[idx] = 0;
      queueA.push(idx);
    }
  }

  // Seed B spawns (liquid)
  for (const idx of spawnB) {
    if (regime[idx] === -1 || fillRegime === 0) {
      // Claim unclaimed OR convert from frozen (in frozenStart mode)
      regime[idx] = 1; // B = Liquid
      strB[idx] = 1.0 + params.biasB + rng() * 0.1;
      strA[idx] = 0;
      queueB.push(idx);
    } else if (regime[idx] === 0 && fillRegime === undefined) {
      // Conflict at spawn (only in normal modes) - compare strengths
      const newStrB = 1.0 + params.biasB + rng() * 0.1;
      if (newStrB > strA[idx]) {
        regime[idx] = 1;
        strB[idx] = newStrB;
        strA[idx] = 0;
        // Move from queueA to queueB
        const aIdx = queueA.indexOf(idx);
        if (aIdx > -1) queueA.splice(aIdx, 1);
        queueB.push(idx);
      }
    }
  }

  // Calculate initial fractions
  let countA = 0, countB = 0;
  for (let i = 0; i < totalCells; i++) {
    if (mask[i] === 1) {
      if (regime[i] === 0) countA++;
      else if (regime[i] === 1) countB++;
    }
  }

  // Set initial global regime for fillRegime modes (so it doesn't "switch" to what it already is)
  const initialGlobal: Regime = fillRegime !== undefined ? fillRegime : -1;

  return {
    regime,
    strA,
    strB,
    mask,
    fracA: countA / activeCells,
    fracB: countB / activeCells,
    global: initialGlobal,
    activeCells,
    queueA,
    queueB,
    step: 0,
    switchFrame: -1,
  };
}

/**
 * Get 4-neighbors within mask
 */
function getNeighbors(idx: number, nx: number, ny: number, mask: Uint8Array): number[] {
  const x = idx % nx;
  const y = Math.floor(idx / nx);
  const neighbors: number[] = [];

  // Up
  if (y > 0) {
    const nIdx = (y - 1) * nx + x;
    if (mask[nIdx] === 1) neighbors.push(nIdx);
  }
  // Down
  if (y < ny - 1) {
    const nIdx = (y + 1) * nx + x;
    if (mask[nIdx] === 1) neighbors.push(nIdx);
  }
  // Left
  if (x > 0) {
    const nIdx = y * nx + (x - 1);
    if (mask[nIdx] === 1) neighbors.push(nIdx);
  }
  // Right
  if (x < nx - 1) {
    const nIdx = y * nx + (x + 1);
    if (mask[nIdx] === 1) neighbors.push(nIdx);
  }

  return neighbors;
}

/**
 * Expand a single front by one step
 */
function expandFront(
  state: BottleState,
  params: BottleParams,
  frontType: 0 | 1, // 0 = A (Frozen), 1 = B (Liquid)
  rng: () => number
): void {
  const { nx, ny } = params;
  const { regime, strA, strB, mask } = state;
  const queue = frontType === 0 ? state.queueA : state.queueB;
  const bias = frontType === 0 ? params.biasA : params.biasB;
  const strength = frontType === 0 ? strA : strB;
  const otherStrength = frontType === 0 ? strB : strA;

  if (queue.length === 0) return;

  // Process current frontier
  const currentFrontier = [...queue];
  queue.length = 0; // Clear for next iteration

  for (const idx of currentFrontier) {
    const neighbors = getNeighbors(idx, nx, ny, mask);

    for (const nIdx of neighbors) {
      const currentRegime = regime[nIdx];
      const newStr = strength[idx] * (0.9 + rng() * 0.2) + bias * rng();

      if (currentRegime === -1) {
        // Unclaimed - claim it
        regime[nIdx] = frontType;
        strength[nIdx] = newStr;
        queue.push(nIdx);
      } else if (currentRegime !== frontType) {
        // Conflict with other regime - compare strengths
        if (newStr > otherStrength[nIdx]) {
          regime[nIdx] = frontType;
          strength[nIdx] = newStr;
          otherStrength[nIdx] = 0;
          queue.push(nIdx);
        }
      }
      // If same regime, skip (already claimed by this front)
    }
  }
}

/**
 * Compute consensus fractions
 */
function computeConsensus(state: BottleState): void {
  const { regime, mask } = state;
  let countA = 0, countB = 0;

  for (let i = 0; i < regime.length; i++) {
    if (mask[i] === 1) {
      if (regime[i] === 0) countA++;
      else if (regime[i] === 1) countB++;
    }
  }

  state.fracA = countA / state.activeCells;
  state.fracB = countB / state.activeCells;
}

/**
 * Apply hysteresis switching logic
 * Returns true if global regime changed
 */
function applyHysteresisSwitch(state: BottleState, params: BottleParams): boolean {
  const hi = params.threshold;
  const lo = Math.max(0, hi - params.hysteresis);
  const prevGlobal = state.global;

  // Check for switch to A (Frozen)
  if (state.global !== 0 && state.fracA >= hi) {
    state.global = 0;
  } else if (state.global === 0 && state.fracA < lo) {
    state.global = -1; // Leave A zone
  }

  // Check for switch to B (Liquid)
  if (state.global !== 1 && state.fracB >= hi) {
    state.global = 1;
  } else if (state.global === 1 && state.fracB < lo) {
    state.global = -1; // Leave B zone
  }

  const changed = prevGlobal !== state.global;
  if (changed && state.global !== -1 && state.switchFrame === -1) {
    state.switchFrame = state.step;
  }

  return changed;
}

/**
 * Main simulation step - call this each frame
 */
export function stepBottleSim(
  state: BottleState,
  params: BottleParams,
  rng: () => number
): { changed: boolean; newGlobal: Regime } {
  // Expand A front speedA times
  for (let s = 0; s < params.speedA; s++) {
    expandFront(state, params, 0, rng);
  }

  // Expand B front speedB times
  for (let s = 0; s < params.speedB; s++) {
    expandFront(state, params, 1, rng);
  }

  // Update consensus
  computeConsensus(state);

  // Check for regime switch
  const changed = applyHysteresisSwitch(state, params);

  state.step++;

  return { changed, newGlobal: state.global };
}

/**
 * Create RNG from seed
 */
export function createRng(seed: number): () => number {
  return mulberry32(seed);
}

/**
 * Check if simulation is complete (no more active fronts)
 */
export function isSimulationComplete(state: BottleState): boolean {
  // Complete when both queues are empty (no more cells to expand)
  return state.queueA.length === 0 && state.queueB.length === 0;
}

/**
 * Get winner regime name
 */
export function getWinnerName(state: BottleState): string | null {
  if (state.global === 0) return 'Frozen';
  if (state.global === 1) return 'Liquid';
  return null;
}
