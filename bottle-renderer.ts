// Bottle Renderer - Canvas-based rendering with visual effects

import { BottleState, Regime, BottleAnimState, Particle } from './bottle-types';

// Color palettes
const COLORS = {
  frozen: {
    base: [59, 130, 246],      // blue-500
    light: [147, 197, 253],    // blue-300
    dark: [30, 64, 175],       // blue-800
    glow: [191, 219, 254],     // blue-200
    active: [255, 255, 255],   // white for active frontier
  },
  liquid: {
    base: [56, 189, 248],      // sky-400 (blue water)
    light: [125, 211, 252],    // sky-300
    dark: [14, 116, 144],      // cyan-700
    glow: [186, 230, 253],     // sky-200
    active: [255, 255, 255],   // white for active frontier
  },
  unclaimed: [39, 39, 42],     // zinc-800 darker
  background: [24, 24, 27],    // zinc-900
  grid: [63, 63, 70],          // zinc-700 for grid lines
};

/**
 * Interpolate between two colors
 */
function lerpColor(c1: number[], c2: number[], t: number): number[] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

/**
 * Get cell color based on regime and strength
 */
function getCellColor(
  regime: number,
  strA: number,
  strB: number,
  globalRegime: Regime,
  transitionProgress: number,
  isActive: boolean = false
): number[] {
  if (regime === -1) {
    return COLORS.unclaimed;
  }

  const palette = regime === 0 ? COLORS.frozen : COLORS.liquid;
  const strength = regime === 0 ? strA : strB;

  // Active frontier cells get bright glow
  if (isActive) {
    return palette.active;
  }

  // Base color with intensity based on strength
  const intensity = Math.min(1, strength / 2);
  let color = lerpColor(palette.dark, palette.light, intensity);

  // Global regime tint overlay
  if (globalRegime !== -1 && transitionProgress > 0) {
    const globalPalette = globalRegime === 0 ? COLORS.frozen : COLORS.liquid;
    const tint = globalPalette.glow;
    color = lerpColor(color, tint, transitionProgress * 0.3);
  }

  return color;
}

/**
 * Render the bottle state to canvas
 */
export function renderBottle(
  ctx: CanvasRenderingContext2D,
  state: BottleState,
  nx: number,
  ny: number,
  animState: BottleAnimState,
  scale: number = 1
): void {
  const width = nx * scale;
  const height = ny * scale;

  const { regime, strA, strB, mask, global: globalRegime, queueA, queueB } = state;
  const { transitionProgress, particles } = animState;

  // Build active cell set for O(1) lookup
  const activeSet = new Set<number>();
  for (const idx of queueA) activeSet.add(idx);
  for (const idx of queueB) activeSet.add(idx);

  // Clear canvas
  ctx.fillStyle = `rgb(${COLORS.background.join(',')})`;
  ctx.fillRect(0, 0, width, height);

  // Simple cell rendering - no clipping, no backgrounds
  const cellPadding = scale > 2 ? 1 : 0;
  const cellSize = scale - cellPadding * 2;

  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = y * nx + x;
      if (mask[idx] === 0) continue;

      const cellRegime = regime[idx];
      const isActive = activeSet.has(idx);
      const px = x * scale + cellPadding;
      const py = y * scale + cellPadding;

      // Get color
      const color = getCellColor(
        cellRegime,
        strA[idx],
        strB[idx],
        globalRegime,
        transitionProgress,
        isActive
      );

      ctx.fillStyle = `rgb(${color.join(',')})`;

      // Simple shapes: squares for ice, circles for water
      if (cellRegime === 1) {
        // Water: circle
        ctx.beginPath();
        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Ice or unclaimed: square
        ctx.fillRect(px, py, cellSize, cellSize);
      }

      // Active glow (only for active cells)
      if (isActive) {
        ctx.strokeStyle = cellRegime === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(34,211,238,0.8)';
        ctx.lineWidth = 2;
        if (cellRegime === 1) {
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeRect(px, py, cellSize, cellSize);
        }
      }
    }
  }

  // Draw particles on top
  renderParticles(ctx, particles, scale);

  // Draw bottle outline
  drawBottleOutline(ctx, nx, ny, scale, globalRegime, transitionProgress);

  // Draw frontier line where the two regimes meet
  drawFrontierLine(ctx, state, nx, ny, scale);
}

/**
 * Draw particles
 */
function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  scale: number
): void {
  for (const p of particles) {
    const alpha = (p.life / p.maxLife);
    const size = p.size * scale * alpha;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.type === 'sparkle') {
      // Sparkle - white star
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, size, 0, Math.PI * 2);
      ctx.fill();
      // Cross sparkle
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x * scale - size * 2, p.y * scale);
      ctx.lineTo(p.x * scale + size * 2, p.y * scale);
      ctx.moveTo(p.x * scale, p.y * scale - size * 2);
      ctx.lineTo(p.x * scale, p.y * scale + size * 2);
      ctx.stroke();
    } else if (p.type === 'bubble') {
      // Bubble - cyan water circle with highlight
      ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, size * 2, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x * scale - size * 0.5, p.y * scale - size * 0.5, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'frost') {
      // Frost - blue crystal
      ctx.fillStyle = `rgba(191, 219, 254, ${alpha})`;
      ctx.beginPath();
      const cx = p.x * scale;
      const cy = p.y * scale;
      const s = size * 1.5;
      // Hexagon shape
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(angle) * s;
        const py = cy + Math.sin(angle) * s;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * Draw bottle outline/rim
 */
function drawBottleOutline(
  ctx: CanvasRenderingContext2D,
  nx: number,
  ny: number,
  scale: number,
  globalRegime: Regime,
  transitionProgress: number
): void {
  const width = nx * scale;
  const height = ny * scale;

  // Determine glow color based on global regime
  let glowColor = 'rgba(113, 113, 122, 0.5)'; // zinc-500
  if (globalRegime === 0) {
    glowColor = `rgba(59, 130, 246, ${0.3 + transitionProgress * 0.5})`; // blue ice
  } else if (globalRegime === 1) {
    glowColor = `rgba(34, 211, 238, ${0.3 + transitionProgress * 0.5})`; // cyan water
  }

  ctx.save();

  // Draw bottle path outline
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 3;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  // Simplified bottle outline (scaled)
  ctx.moveTo(0.35 * width, 0.02 * height);
  ctx.lineTo(0.65 * width, 0.02 * height);
  ctx.lineTo(0.65 * width, 0.06 * height);
  ctx.lineTo(0.58 * width, 0.08 * height);
  ctx.lineTo(0.58 * width, 0.12 * height);
  ctx.lineTo(0.62 * width, 0.14 * height);
  ctx.lineTo(0.62 * width, 0.16 * height);
  ctx.lineTo(0.72 * width, 0.20 * height);
  ctx.lineTo(0.75 * width, 0.28 * height);
  ctx.lineTo(0.76 * width, 0.40 * height);
  ctx.lineTo(0.76 * width, 0.85 * height);
  ctx.lineTo(0.72 * width, 0.94 * height);
  ctx.lineTo(0.60 * width, 0.98 * height);
  ctx.lineTo(0.40 * width, 0.98 * height);
  ctx.lineTo(0.28 * width, 0.94 * height);
  ctx.lineTo(0.24 * width, 0.85 * height);
  ctx.lineTo(0.24 * width, 0.40 * height);
  ctx.lineTo(0.25 * width, 0.28 * height);
  ctx.lineTo(0.28 * width, 0.20 * height);
  ctx.lineTo(0.38 * width, 0.16 * height);
  ctx.lineTo(0.38 * width, 0.14 * height);
  ctx.lineTo(0.42 * width, 0.12 * height);
  ctx.lineTo(0.42 * width, 0.08 * height);
  ctx.lineTo(0.35 * width, 0.06 * height);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw frontier line where the two regimes meet
 */
function drawFrontierLine(
  ctx: CanvasRenderingContext2D,
  state: BottleState,
  nx: number,
  ny: number,
  scale: number
): void {
  const { regime, mask } = state;

  ctx.save();
  ctx.lineWidth = scale >= 3 ? 2 : 1;

  // Find edges between different regimes
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = y * nx + x;
      if (mask[idx] === 0) continue;

      const r = regime[idx];
      if (r === -1) continue; // Skip unclaimed

      // Check right neighbor
      if (x < nx - 1) {
        const rightIdx = y * nx + (x + 1);
        const rightR = regime[rightIdx];
        if (mask[rightIdx] !== 0 && rightR !== -1 && rightR !== r) {
          // Draw vertical edge
          const edgeX = (x + 1) * scale;
          const edgeY = y * scale;
          const gradient = ctx.createLinearGradient(edgeX - 4, edgeY, edgeX + 4, edgeY);
          gradient.addColorStop(0, r === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 211, 238, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(1, rightR === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 211, 238, 0.8)');
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(edgeX, edgeY);
          ctx.lineTo(edgeX, edgeY + scale);
          ctx.stroke();
        }
      }

      // Check bottom neighbor
      if (y < ny - 1) {
        const bottomIdx = (y + 1) * nx + x;
        const bottomR = regime[bottomIdx];
        if (mask[bottomIdx] !== 0 && bottomR !== -1 && bottomR !== r) {
          // Draw horizontal edge
          const edgeX = x * scale;
          const edgeY = (y + 1) * scale;
          const gradient = ctx.createLinearGradient(edgeX, edgeY - 4, edgeX, edgeY + 4);
          gradient.addColorStop(0, r === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 211, 238, 0.8)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(1, bottomR === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(34, 211, 238, 0.8)');
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(edgeX, edgeY);
          ctx.lineTo(edgeX + scale, edgeY);
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();
}

/**
 * Draw progress ring
 */
export function drawProgressRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fracA: number,
  fracB: number,
  globalRegime: Regime
): void {
  const maxFrac = Math.max(fracA, fracB);
  const winner = fracA > fracB ? 0 : 1;

  ctx.save();

  // Background ring
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(63, 63, 70, 0.5)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Progress arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + maxFrac * Math.PI * 2;

  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.strokeStyle = winner === 0 ? '#3b82f6' : '#22d3ee';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Center text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(maxFrac * 100)}%`, x, y);

  ctx.restore();
}
