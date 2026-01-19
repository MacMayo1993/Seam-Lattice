import { describe, it, expect } from 'vitest';
import { wrapCoord, getNeighbors, createGrid, checkAnnihilation, calculateCoherence, randomizeGrid } from './latticeLogic';
import { CellState } from '../types';

describe('Toroidal Topology - wrapCoord', () => {
  it('should wrap positive overflow to beginning', () => {
    expect(wrapCoord(10, 10)).toBe(0);
    expect(wrapCoord(11, 10)).toBe(1);
    expect(wrapCoord(15, 10)).toBe(5);
  });

  it('should wrap negative values to end', () => {
    expect(wrapCoord(-1, 10)).toBe(9);
    expect(wrapCoord(-2, 10)).toBe(8);
    expect(wrapCoord(-10, 10)).toBe(0);
    expect(wrapCoord(-11, 10)).toBe(9);
  });

  it('should handle values within bounds without modification', () => {
    expect(wrapCoord(0, 10)).toBe(0);
    expect(wrapCoord(5, 10)).toBe(5);
    expect(wrapCoord(9, 10)).toBe(9);
  });

  it('should handle multiple wraps', () => {
    expect(wrapCoord(20, 10)).toBe(0);
    expect(wrapCoord(25, 10)).toBe(5);
    expect(wrapCoord(-20, 10)).toBe(0);
    expect(wrapCoord(-25, 10)).toBe(5);
  });

  it('should work with different grid sizes', () => {
    expect(wrapCoord(5, 5)).toBe(0);
    expect(wrapCoord(-1, 5)).toBe(4);
    expect(wrapCoord(15, 15)).toBe(0);
    expect(wrapCoord(-1, 15)).toBe(14);
  });
});

describe('Toroidal Topology - getNeighbors', () => {
  const gridSize = 10;

  it('should get 4 neighbors for center cell', () => {
    const neighbors = getNeighbors({ row: 5, col: 5 }, gridSize);

    expect(neighbors).toHaveLength(4);
    expect(neighbors).toContainEqual({ row: 4, col: 5 }); // Up
    expect(neighbors).toContainEqual({ row: 6, col: 5 }); // Down
    expect(neighbors).toContainEqual({ row: 5, col: 4 }); // Left
    expect(neighbors).toContainEqual({ row: 5, col: 6 }); // Right
  });

  it('should wrap neighbors at top edge (toroidal)', () => {
    const neighbors = getNeighbors({ row: 0, col: 5 }, gridSize);

    expect(neighbors).toContainEqual({ row: 9, col: 5 }); // Up wraps to bottom
    expect(neighbors).toContainEqual({ row: 1, col: 5 }); // Down
    expect(neighbors).toContainEqual({ row: 0, col: 4 }); // Left
    expect(neighbors).toContainEqual({ row: 0, col: 6 }); // Right
  });

  it('should wrap neighbors at bottom edge (toroidal)', () => {
    const neighbors = getNeighbors({ row: 9, col: 5 }, gridSize);

    expect(neighbors).toContainEqual({ row: 8, col: 5 }); // Up
    expect(neighbors).toContainEqual({ row: 0, col: 5 }); // Down wraps to top
    expect(neighbors).toContainEqual({ row: 9, col: 4 }); // Left
    expect(neighbors).toContainEqual({ row: 9, col: 6 }); // Right
  });

  it('should wrap neighbors at left edge (toroidal)', () => {
    const neighbors = getNeighbors({ row: 5, col: 0 }, gridSize);

    expect(neighbors).toContainEqual({ row: 4, col: 0 }); // Up
    expect(neighbors).toContainEqual({ row: 6, col: 0 }); // Down
    expect(neighbors).toContainEqual({ row: 5, col: 9 }); // Left wraps to right
    expect(neighbors).toContainEqual({ row: 5, col: 1 }); // Right
  });

  it('should wrap neighbors at right edge (toroidal)', () => {
    const neighbors = getNeighbors({ row: 5, col: 9 }, gridSize);

    expect(neighbors).toContainEqual({ row: 4, col: 9 }); // Up
    expect(neighbors).toContainEqual({ row: 6, col: 9 }); // Down
    expect(neighbors).toContainEqual({ row: 5, col: 8 }); // Left
    expect(neighbors).toContainEqual({ row: 5, col: 0 }); // Right wraps to left
  });

  it('should wrap neighbors at top-left corner (toroidal)', () => {
    const neighbors = getNeighbors({ row: 0, col: 0 }, gridSize);

    expect(neighbors).toContainEqual({ row: 9, col: 0 }); // Up wraps to bottom
    expect(neighbors).toContainEqual({ row: 1, col: 0 }); // Down
    expect(neighbors).toContainEqual({ row: 0, col: 9 }); // Left wraps to right
    expect(neighbors).toContainEqual({ row: 0, col: 1 }); // Right
  });

  it('should wrap neighbors at bottom-right corner (toroidal)', () => {
    const neighbors = getNeighbors({ row: 9, col: 9 }, gridSize);

    expect(neighbors).toContainEqual({ row: 8, col: 9 }); // Up
    expect(neighbors).toContainEqual({ row: 0, col: 9 }); // Down wraps to top
    expect(neighbors).toContainEqual({ row: 9, col: 8 }); // Left
    expect(neighbors).toContainEqual({ row: 9, col: 0 }); // Right wraps to left
  });

  it('should work with different grid sizes', () => {
    const smallNeighbors = getNeighbors({ row: 0, col: 0 }, 5);
    expect(smallNeighbors).toContainEqual({ row: 4, col: 0 }); // Up wraps
    expect(smallNeighbors).toContainEqual({ row: 0, col: 4 }); // Left wraps

    const largeNeighbors = getNeighbors({ row: 0, col: 0 }, 25);
    expect(largeNeighbors).toContainEqual({ row: 24, col: 0 }); // Up wraps
    expect(largeNeighbors).toContainEqual({ row: 0, col: 24 }); // Left wraps
  });

  it('should always return exactly 4 neighbors', () => {
    // Test various positions
    const positions = [
      { row: 0, col: 0 },   // Corner
      { row: 0, col: 5 },   // Edge
      { row: 5, col: 5 },   // Center
      { row: 9, col: 9 },   // Corner
    ];

    positions.forEach(pos => {
      const neighbors = getNeighbors(pos, gridSize);
      expect(neighbors).toHaveLength(4);
    });
  });
});

describe('Grid Operations', () => {
  it('should create a grid with specified size and initial state', () => {
    const grid = createGrid(10, CellState.POSITIVE);

    expect(grid).toHaveLength(10);
    expect(grid[0]).toHaveLength(10);
    expect(grid[5][5]).toBe(CellState.POSITIVE);
  });

  it('should create a grid with POSITIVE state by default', () => {
    const grid = createGrid(5);

    expect(grid[0][0]).toBe(CellState.POSITIVE);
    expect(grid[4][4]).toBe(CellState.POSITIVE);
  });

  it('should detect annihilation when all cells are same state', () => {
    const uniformPositive = createGrid(10, CellState.POSITIVE);
    const uniformNegative = createGrid(10, CellState.NEGATIVE);

    expect(checkAnnihilation(uniformPositive)).toBe(true);
    expect(checkAnnihilation(uniformNegative)).toBe(true);
  });

  it('should not detect annihilation when cells differ', () => {
    const mixedGrid = createGrid(10, CellState.POSITIVE);
    mixedGrid[5][5] = CellState.NEGATIVE; // Flip one cell

    expect(checkAnnihilation(mixedGrid)).toBe(false);
  });

  it('should handle empty grid', () => {
    const emptyGrid: CellState[][] = [];
    expect(checkAnnihilation(emptyGrid)).toBe(true);
  });
});

describe('Coherence Calculations', () => {
  it('should return 1.0 for all positive cells', () => {
    const grid = createGrid(10, CellState.POSITIVE);
    expect(calculateCoherence(grid)).toBe(1.0);
  });

  it('should return -1.0 for all negative cells', () => {
    const grid = createGrid(10, CellState.NEGATIVE);
    expect(calculateCoherence(grid)).toBe(-1.0);
  });

  it('should return 0.0 for perfectly balanced grid', () => {
    const grid = createGrid(4, CellState.POSITIVE); // 16 cells
    // Make half negative (8 cells)
    grid[0][0] = CellState.NEGATIVE;
    grid[0][1] = CellState.NEGATIVE;
    grid[0][2] = CellState.NEGATIVE;
    grid[0][3] = CellState.NEGATIVE;
    grid[1][0] = CellState.NEGATIVE;
    grid[1][1] = CellState.NEGATIVE;
    grid[1][2] = CellState.NEGATIVE;
    grid[1][3] = CellState.NEGATIVE;

    expect(calculateCoherence(grid)).toBe(0.0);
  });

  it('should calculate partial coherence correctly', () => {
    const grid = createGrid(3, CellState.POSITIVE); // 9 cells, all +1
    grid[0][0] = CellState.NEGATIVE; // 1 cell -1, 8 cells +1

    // Sum: 8 - 1 = 7, Total: 9, Coherence: 7/9 ≈ 0.777...
    expect(calculateCoherence(grid)).toBeCloseTo(7/9, 5);
  });
});

describe('Grid Randomization', () => {
  it('should create a grid with mixed states', () => {
    const grid = randomizeGrid(20);

    expect(grid).toHaveLength(20);
    expect(grid[0]).toHaveLength(20);

    // Check that we have both states (probabilistically almost certain with 400 cells)
    let hasPositive = false;
    let hasNegative = false;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell === CellState.POSITIVE) hasPositive = true;
        if (cell === CellState.NEGATIVE) hasNegative = true;
      });
    });

    expect(hasPositive).toBe(true);
    expect(hasNegative).toBe(true);
  });

  it('should produce different results on multiple calls', () => {
    const grid1 = randomizeGrid(10);
    const grid2 = randomizeGrid(10);

    // Check that grids are different (probabilistically almost certain)
    let differences = 0;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (grid1[i][j] !== grid2[i][j]) {
          differences++;
        }
      }
    }

    expect(differences).toBeGreaterThan(0);
  });
});

describe('Toroidal Path Continuity', () => {
  it('should allow a path to wrap around horizontally', () => {
    const gridSize = 10;

    // Start at right edge
    const start = { row: 5, col: 9 };
    const neighbors = getNeighbors(start, gridSize);

    // Right neighbor should be at left edge (col 0)
    const rightNeighbor = neighbors.find(n => n.col === 0);
    expect(rightNeighbor).toBeDefined();
    expect(rightNeighbor?.row).toBe(5);
  });

  it('should allow a path to wrap around vertically', () => {
    const gridSize = 10;

    // Start at bottom edge
    const start = { row: 9, col: 5 };
    const neighbors = getNeighbors(start, gridSize);

    // Down neighbor should be at top edge (row 0)
    const downNeighbor = neighbors.find(n => n.row === 0);
    expect(downNeighbor).toBeDefined();
    expect(downNeighbor?.col).toBe(5);
  });

  it('should create a continuous path around the entire grid', () => {
    const gridSize = 5;

    // Walk right around the entire grid (should return to start)
    let current = { row: 0, col: 0 };

    for (let i = 0; i < gridSize; i++) {
      const neighbors = getNeighbors(current, gridSize);
      const rightNeighbor = neighbors.find(n => n.row === current.row && n.col !== current.col);
      expect(rightNeighbor).toBeDefined();
      current = { row: current.row, col: wrapCoord(current.col + 1, gridSize) };
    }

    // Should be back at start
    expect(current).toEqual({ row: 0, col: 0 });
  });
});
