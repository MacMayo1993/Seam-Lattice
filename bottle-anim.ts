// Bottle Animations - Particles and transition effects

import { BottleAnimState, Particle, Regime, BottleState } from './bottle-types';

/**
 * Create initial animation state
 */
export function createAnimState(): BottleAnimState {
  return {
    transitioning: false,
    transitionProgress: 0,
    fromRegime: -1,
    toRegime: -1,
    particles: [],
  };
}

/**
 * Trigger a regime transition animation
 */
export function triggerTransition(
  animState: BottleAnimState,
  fromRegime: Regime,
  toRegime: Regime
): void {
  animState.transitioning = true;
  animState.transitionProgress = 0;
  animState.fromRegime = fromRegime;
  animState.toRegime = toRegime;

  // Clear old particles
  animState.particles = [];
}

/**
 * Update animation state
 */
export function updateAnimState(
  animState: BottleAnimState,
  state: BottleState,
  nx: number,
  ny: number,
  deltaTime: number
): void {
  // Update transition progress
  if (animState.transitioning) {
    animState.transitionProgress += deltaTime * 2; // Complete in ~0.5s
    if (animState.transitionProgress >= 1) {
      animState.transitionProgress = 1;
      animState.transitioning = false;
    }
  }

  // Spawn particles based on global regime
  if (state.global !== -1) {
    spawnRegimeParticles(animState, state, nx, ny);
  }

  // Update existing particles
  updateParticles(animState, deltaTime);
}

/**
 * Spawn particles based on current regime
 */
function spawnRegimeParticles(
  animState: BottleAnimState,
  state: BottleState,
  nx: number,
  ny: number
): void {
  const maxParticles = 50;
  if (animState.particles.length >= maxParticles) return;

  // Spawn rate based on transition
  const spawnChance = animState.transitioning ? 0.3 : 0.05;
  if (Math.random() > spawnChance) return;

  const { mask, global: globalRegime } = state;

  // Find a random active cell
  let attempts = 0;
  while (attempts < 10) {
    const x = Math.floor(Math.random() * nx);
    const y = Math.floor(Math.random() * ny);
    const idx = y * nx + x;

    if (mask[idx] === 1) {
      const particle: Particle = {
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: globalRegime === 0 ? -Math.random() * 3 - 1 : -Math.random() * 2 - 0.5, // Upward
        life: 1,
        maxLife: 1,
        size: Math.random() * 2 + 1,
        type: globalRegime === 0 ? (Math.random() > 0.5 ? 'sparkle' : 'frost') : 'bubble',
      };
      animState.particles.push(particle);
      break;
    }
    attempts++;
  }
}

/**
 * Update particle positions and life
 */
function updateParticles(animState: BottleAnimState, deltaTime: number): void {
  const decay = deltaTime * 0.8; // Life decay per second

  for (let i = animState.particles.length - 1; i >= 0; i--) {
    const p = animState.particles[i];

    // Update position
    p.x += p.vx * deltaTime * 30;
    p.y += p.vy * deltaTime * 30;

    // Add some wobble
    p.vx += (Math.random() - 0.5) * 0.5;

    // Decay life
    p.life -= decay;

    // Remove dead particles
    if (p.life <= 0) {
      animState.particles.splice(i, 1);
    }
  }
}

/**
 * Spawn burst of particles for dramatic effect
 */
export function spawnBurst(
  animState: BottleAnimState,
  x: number,
  y: number,
  count: number,
  type: 'sparkle' | 'bubble' | 'frost'
): void {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    const particle: Particle = {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      size: Math.random() * 3 + 2,
      type,
    };
    animState.particles.push(particle);
  }
}

/**
 * Get transition message for display
 */
export function getTransitionMessage(animState: BottleAnimState): string | null {
  if (!animState.transitioning) return null;

  if (animState.toRegime === 0) {
    return 'FREEZING!';
  } else if (animState.toRegime === 1) {
    return 'MELTING!';
  }
  return null;
}

/**
 * Get regime status message
 */
export function getRegimeStatus(globalRegime: Regime, fracA: number, fracB: number, switchFrame: number = -1): string {
  const maxFrac = Math.max(fracA, fracB);
  const leading = fracA > fracB ? 'Frozen' : 'Liquid';

  // Only show "Complete!" if there was actually a switch
  if (switchFrame !== -1) {
    if (globalRegime === 0) {
      return 'FROZEN - Complete!';
    } else if (globalRegime === 1) {
      return 'LIQUID - Complete!';
    }
  }

  // Show progress during simulation
  if (maxFrac > 0.95) {
    return `${leading} almost complete (${Math.round(maxFrac * 100)}%)`;
  } else if (maxFrac > 0.7) {
    return `${leading} spreading (${Math.round(maxFrac * 100)}%)`;
  } else if (maxFrac > 0.5) {
    return `${leading} leading (${Math.round(maxFrac * 100)}%)`;
  } else {
    return 'Propagating...';
  }
}
