import { SimulationConfig } from './types';

export interface Example {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: SimulationConfig;
  setupInstructions?: string;
  expectedOutcome?: string;
  learningGoal: string;
}

export const EXAMPLES: Example[] = [
  {
    id: 'first-ignition',
    name: 'First Ignition',
    description: 'Basic cascade from center - your first seam propagation',
    icon: '⚡',
    config: {
      gridSize: 15,
      thresholdK: 0.618,
      propagationBias: 0.1,
      delay: 100,
    },
    setupInstructions: 'Click "Ignite" to start a cascade from the center cell',
    expectedOutcome: 'Watch the seam propagate outward in a wave pattern',
    learningGoal: 'Understand basic seam propagation and wave patterns'
  },
  {
    id: 'guaranteed-annihilation',
    name: 'Guaranteed Resolution',
    description: 'High bias ensures complete cascade - see resolution in action',
    icon: '✓',
    config: {
      gridSize: 15,
      thresholdK: 0.618,
      propagationBias: 0.4,
      delay: 80,
    },
    setupInstructions: 'Click "Ignite" and watch the entire grid unify',
    expectedOutcome: 'The cascade will spread to all cells, achieving annihilation',
    learningGoal: 'See how high bias creates inevitable resolution'
  },
  {
    id: 'critical-threshold',
    name: 'Critical Threshold',
    description: 'Balanced at k* - cascades are unpredictable',
    icon: '⚠️',
    config: {
      gridSize: 21,
      thresholdK: 0.618,
      propagationBias: 0.0,
      delay: 100,
    },
    setupInstructions: 'Try igniting multiple times - each outcome differs',
    expectedOutcome: 'Sometimes spreads, sometimes dies out - this is the phase transition',
    learningGoal: 'Experience the critical point where behavior becomes unpredictable'
  },
  {
    id: 'edge-wrapping',
    name: 'Edge Wrapping Demo',
    description: 'Start near corner to see toroidal topology in action',
    icon: '🔄',
    config: {
      gridSize: 11,
      thresholdK: 0.618,
      propagationBias: 0.3,
      delay: 150,
    },
    setupInstructions: 'Ignite from center, watch edges wrap around',
    expectedOutcome: 'Seam wraps from top to bottom, left to right',
    learningGoal: 'Understand toroidal topology - no true edges'
  },
  {
    id: 'slow-cascade',
    name: 'Slow Cascade',
    description: 'Low bias, slow animation - watch every step',
    icon: '🐌',
    config: {
      gridSize: 17,
      thresholdK: 0.618,
      propagationBias: 0.05,
      delay: 200,
    },
    setupInstructions: 'Perfect for learning - see each propagation decision',
    expectedOutcome: 'Slow, careful spread - easy to observe mechanism',
    learningGoal: 'Observe the probabilistic nature of propagation'
  },
  {
    id: 'fast-takeover',
    name: 'Fast Takeover',
    description: 'High bias, fast animation - explosive cascade',
    icon: '💥',
    config: {
      gridSize: 25,
      thresholdK: 0.618,
      propagationBias: 0.45,
      delay: 50,
    },
    setupInstructions: 'Click ignite and watch the explosion!',
    expectedOutcome: 'Rapid, aggressive cascade consuming the entire grid',
    learningGoal: 'See how bias dramatically affects propagation speed'
  },
  {
    id: 'large-grid',
    name: 'Large Grid Exploration',
    description: 'See patterns emerge at scale',
    icon: '📊',
    config: {
      gridSize: 35,
      thresholdK: 0.618,
      propagationBias: 0.2,
      delay: 60,
    },
    setupInstructions: 'Larger grid shows fractal-like propagation patterns',
    expectedOutcome: 'Complex wave interference and boundary effects',
    learningGoal: 'Observe emergent complexity in larger systems'
  },
  {
    id: 'random-start',
    name: 'Chaos to Order',
    description: 'Start from randomized grid - watch self-organization',
    icon: '🎲',
    config: {
      gridSize: 19,
      thresholdK: 0.618,
      propagationBias: 0.25,
      delay: 100,
    },
    setupInstructions: 'Click "Randomize" first, then "Ignite" from a random spot',
    expectedOutcome: 'Order emerges from chaos as domains compete',
    learningGoal: 'See how local rules create global patterns'
  }
];

export const getExampleById = (id: string): Example | undefined => {
  return EXAMPLES.find(ex => ex.id === id);
};

export const getDefaultExample = (): Example => {
  return EXAMPLES[0]; // First Ignition
};
