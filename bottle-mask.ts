// Bottle Mask Generation - SVG path to raster mask

// Water bottle SVG path (normalized to 0-1 coordinate space)
// This is a simple water bottle silhouette
const BOTTLE_PATH = `
  M 0.35 0.02
  L 0.65 0.02
  L 0.65 0.06
  L 0.58 0.08
  L 0.58 0.12
  L 0.62 0.14
  L 0.62 0.16
  L 0.72 0.20
  L 0.75 0.28
  L 0.76 0.40
  L 0.76 0.85
  L 0.72 0.94
  L 0.60 0.98
  L 0.40 0.98
  L 0.28 0.94
  L 0.24 0.85
  L 0.24 0.40
  L 0.25 0.28
  L 0.28 0.20
  L 0.38 0.16
  L 0.38 0.14
  L 0.42 0.12
  L 0.42 0.08
  L 0.35 0.06
  Z
`;

/**
 * Generate a rasterized mask from the bottle path
 */
export function generateBottleMask(nx: number, ny: number): Uint8Array {
  const mask = new Uint8Array(nx * ny);

  // Create an offscreen canvas for rasterization
  const canvas = document.createElement('canvas');
  canvas.width = nx;
  canvas.height = ny;
  const ctx = canvas.getContext('2d')!;

  // Parse and draw the path
  ctx.fillStyle = 'white';
  ctx.beginPath();

  const commands = BOTTLE_PATH.trim().split(/\s+/);
  let i = 0;
  while (i < commands.length) {
    const cmd = commands[i];
    switch (cmd) {
      case 'M':
        ctx.moveTo(parseFloat(commands[i + 1]) * nx, parseFloat(commands[i + 2]) * ny);
        i += 3;
        break;
      case 'L':
        ctx.lineTo(parseFloat(commands[i + 1]) * nx, parseFloat(commands[i + 2]) * ny);
        i += 3;
        break;
      case 'Z':
        ctx.closePath();
        i += 1;
        break;
      default:
        i += 1;
    }
  }

  ctx.fill();

  // Extract pixel data
  const imageData = ctx.getImageData(0, 0, nx, ny);
  const data = imageData.data;

  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = (y * nx + x) * 4;
      // Check if pixel is filled (any RGB > 128)
      mask[y * nx + x] = data[idx] > 128 ? 1 : 0;
    }
  }

  return mask;
}

/**
 * Get spawn points based on preset
 */
export function getSpawnPoints(
  spawn: 'capVsBase' | 'leftVsRight' | 'neckVsBody' | 'frozenStart' | 'liquidStart' | 'custom',
  mask: Uint8Array,
  nx: number,
  ny: number
): { spawnA: number[]; spawnB: number[]; fillRegime?: 0 | 1 } {
  const spawnA: number[] = [];
  const spawnB: number[] = [];

  switch (spawn) {
    case 'capVsBase': {
      // A (Frozen) from top (cap), B (Liquid) from bottom (base)
      for (let x = 0; x < nx; x++) {
        // Find topmost active cell in this column for A
        for (let y = 0; y < ny; y++) {
          if (mask[y * nx + x] === 1) {
            spawnA.push(y * nx + x);
            break;
          }
        }
        // Find bottommost active cell in this column for B
        for (let y = ny - 1; y >= 0; y--) {
          if (mask[y * nx + x] === 1) {
            spawnB.push(y * nx + x);
            break;
          }
        }
      }
      break;
    }

    case 'leftVsRight': {
      // A (Frozen) from right, B (Liquid) from left
      for (let y = 0; y < ny; y++) {
        // Find leftmost active cell for B
        for (let x = 0; x < nx; x++) {
          if (mask[y * nx + x] === 1) {
            spawnB.push(y * nx + x);
            break;
          }
        }
        // Find rightmost active cell for A
        for (let x = nx - 1; x >= 0; x--) {
          if (mask[y * nx + x] === 1) {
            spawnA.push(y * nx + x);
            break;
          }
        }
      }
      break;
    }

    case 'neckVsBody': {
      // A from neck (top portion), B from body (bottom portion)
      const neckY = Math.floor(ny * 0.2); // Neck ends around 20% down
      const bodyY = Math.floor(ny * 0.5); // Body starts around 50% down

      for (let x = 0; x < nx; x++) {
        for (let y = 0; y < neckY; y++) {
          if (mask[y * nx + x] === 1) {
            spawnA.push(y * nx + x);
          }
        }
        for (let y = bodyY; y < ny; y++) {
          if (mask[y * nx + x] === 1) {
            spawnB.push(y * nx + x);
          }
        }
      }
      break;
    }

    case 'frozenStart': {
      // Bottle starts fully frozen, liquid spawns from CENTER
      const cx = Math.floor(nx / 2);
      const cy = Math.floor(ny * 0.6); // Slightly below center (in body of bottle)
      // Spawn a small cluster at center
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const idx = (cy + dy) * nx + (cx + dx);
          if (idx >= 0 && idx < nx * ny && mask[idx] === 1) {
            spawnB.push(idx);
          }
        }
      }
      return { spawnA, spawnB, fillRegime: 0 }; // Fill with frozen
    }

    case 'liquidStart': {
      // Bottle starts fully liquid, frozen spawns from CENTER
      const cx = Math.floor(nx / 2);
      const cy = Math.floor(ny * 0.6); // Slightly below center (in body of bottle)
      // Spawn a small cluster at center
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const idx = (cy + dy) * nx + (cx + dx);
          if (idx >= 0 && idx < nx * ny && mask[idx] === 1) {
            spawnA.push(idx);
          }
        }
      }
      return { spawnA, spawnB, fillRegime: 1 }; // Fill with liquid
    }

    case 'custom':
    default: {
      // Center point for both - they'll compete from same location
      const cx = Math.floor(nx / 2);
      const cy = Math.floor(ny / 2);
      if (mask[cy * nx + cx] === 1) {
        spawnA.push(cy * nx + cx);
        spawnB.push(cy * nx + cx);
      }
      break;
    }
  }

  return { spawnA, spawnB };
}

/**
 * Get boundary cells of the mask (for frost rim effect)
 */
export function getMaskBoundary(mask: Uint8Array, nx: number, ny: number): number[] {
  const boundary: number[] = [];

  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = y * nx + x;
      if (mask[idx] === 1) {
        // Check if any neighbor is outside mask
        const neighbors = [
          y > 0 ? (y - 1) * nx + x : -1,
          y < ny - 1 ? (y + 1) * nx + x : -1,
          x > 0 ? y * nx + (x - 1) : -1,
          x < nx - 1 ? y * nx + (x + 1) : -1,
        ];

        for (const nIdx of neighbors) {
          if (nIdx === -1 || mask[nIdx] === 0) {
            boundary.push(idx);
            break;
          }
        }
      }
    }
  }

  return boundary;
}
