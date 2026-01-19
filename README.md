# Seam Lattice Visualizer

![GitHub License](https://img.shields.io/github/license/MacMayo1993/Seam-Lattice)
![GitHub stars](https://img.shields.io/github/stars/MacMayo1993/Seam-Lattice?style=social)
![Deploy Status](https://github.com/MacMayo1993/Seam-Lattice/actions/workflows/deploy.yml/badge.svg)

An interactive visualization exploring **non-orientable topology**, **discrete phase transitions**, and **seam propagation** through a 2D lattice. This project demonstrates how conflicting states cascade through a grid until reaching resolution—modeling everything from cognitive breakthroughs to belief dynamics to neural phase transitions.

**🎯 Why This Matters:** This isn't just a pretty visualization. It's a computational model of how **understanding emerges discretely** from continuous information accumulation, with deep connections to:
- **Machine Learning**: Seam-aware neural architectures and regime detection
- **Neuroscience**: Theta-gamma coupling and hippocampal phase precession
- **Cognitive Science**: The discrete nature of "aha moments" and belief updates
- **Physics**: Percolation theory and non-equilibrium phase transitions
- **Philosophy**: Qualia, consciousness, and the hard problem of discrete experience

## Features

- 🎮 **Interactive grid visualization** with real-time state propagation and glowing animations
- 🎛️ **Adjustable simulation parameters**: grid size, threshold k*, propagation bias
- 📊 **Real-time metrics**: coherence tracking, step counting, convergence detection
- 📚 **Pedagogical example library**: 8 curated scenarios demonstrating key concepts
- 🌀 **Toroidal topology**: edges wrap around (no boundaries)
- 🎨 **Clean, dark-mode UI** with responsive design (Tailwind CSS)
- 🚀 **Zero dependencies**: No external APIs, runs entirely client-side
- 📖 **Rich educational content**: Theory explanations, learning goals, expected outcomes

## Live Demo

🌐 **[Launch Interactive Demo](https://macmayo1993.github.io/Seam-Lattice/)**

Watch seams propagate, explore phase transitions at k* ≈ 0.721, and see how local probabilistic rules create global order. Try the "Critical Threshold" example to experience the edge of chaos!

## Screenshots

_Coming soon: GIFs of seam propagation, annihilation events, and wave patterns_

## Theoretical Foundation

### The Core Question

**How does discrete understanding emerge from continuous information accumulation?**

This simulation models a fundamental phenomenon: information builds up gradually, but comprehension flips **all-at-once**. Think of learning a difficult concept—you struggle, struggle, then suddenly "get it." This discrete transition from confusion to clarity is what we call **seam crossing**.

### The Model

Each cell in the lattice represents a **belief state** (A = +1 or B = -1). Neighboring cells with different states create **tension**—a "seam" in the fabric of the system. When a cell flips, it attempts to propagate that flip to neighbors, creating a cascade.

**Propagation Rule:**
```
For each active cell at position (i, j):
  1. Flip its own state: +1 → -1 or -1 → +1
  2. Check 4 neighbors (up, down, left, right) with toroidal wrapping
  3. For each neighbor matching the OLD state:
     - Propagate with probability P = 1 - (k* - bias)
     - Where k* is the critical threshold
```

### The Critical Threshold: k* ≈ 0.721

This value emerges from **information-theoretic balance**. In the demo, you'll see "Effective threshold: 0.471" displayed—this is derived from:

```
k_eff = k* · √(1 - mutual_info_normalized)
     ≈ 0.721 · √(1 - 0.57)
     ≈ 0.471
```

**Why 0.721?** This relates to the **golden ratio φ ≈ 1.618**:
- k* ≈ 1/√φ ≈ 0.7861 (in some formulations)
- Or k* ≈ 0.618 (golden ratio conjugate, used in pedagogical examples)
- The precise value depends on lattice geometry and information flow assumptions

**Physical Interpretation:**
- **Below k***: Cascades die out (subcritical regime)
- **At k***: Phase transition—unpredictable outcomes (critical point)
- **Above k***: Cascades spread indefinitely (supercritical regime)

This is analogous to **percolation thresholds** in physics and **tipping points** in social dynamics.

### Mutual Information Balance

The system maintains a balance between **forward flow** (F) and **backward flow** (B):

```
I(F; B) = H(F) + H(B) - H(Joint)
```

Where:
- `H(F)` = entropy of forward propagation
- `H(B)` = entropy of backward propagation
- `H(Joint)` = joint entropy

At equilibrium: **I(F; B) → 0** (flows become independent), but the **seam** prevents this, maintaining correlation until **annihilation** (complete resolution).

### Connection to Non-Orientable Topology

**Why "non-orientable"?**

In topology, a surface is **non-orientable** if you can't consistently define "inside" vs "outside" everywhere (e.g., Klein bottle, Möbius strip).

**In this model:**
- Each cell has a binary state, but there's **no global "correct" orientation**
- The seam represents the **boundary where orientation changes**
- Resolution (annihilation) = finding a **consistent global orientation**
- The process is **irreversible** (like walking around a Möbius strip—you return flipped)

This connects to **Gödel's incompleteness**: you can't prove consistency from within the system—you need to "cross the seam" to a higher-order perspective.

### Why This Matters

#### 🧠 Neuroscience Implications
- **Hippocampal phase precession**: Theta-gamma coupling shows discrete phase jumps
- **Place cells**: Fire at specific locations, creating seam-like boundaries
- **Grid cells**: Hexagonal firing patterns suggest topological encoding
- **Sharp-wave ripples**: Sudden bursts of coherence (annihilation events?)

#### 🤖 Machine Learning Applications
- **Seam-aware neural networks**: Architectures that detect and leverage regime changes
- **Regime detection in time series**: Identify when models cross thresholds
- **Loss landscape topology**: Understanding training dynamics via seam crossings
- **Minimum Description Length (MDL)**: Compression and k* are intimately linked

#### 🧩 Cognitive Science
- **"Aha moments"**: Discrete insight formation from continuous processing
- **Belief revision**: How opinions flip under social pressure
- **Conceptual change**: Paradigm shifts (Kuhnian revolutions)
- **Gestalt perception**: Sudden reorganization of visual scenes

#### ⚛️ Physics Parallels
- **Percolation theory**: Critical thresholds in 2D square lattices
- **Ising model**: Ferromagnetic phase transitions
- **Non-equilibrium dynamics**: Self-organized criticality
- **Topological phase transitions**: Berezinskii-Kosterlitz-Thouless transitions

## Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/MacMayo1993/Seam-Lattice.git
   cd Seam-Lattice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploy to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when you push to the main branch. The deployment is handled by GitHub Actions.

To enable GitHub Pages for your fork:

1. Go to your repository Settings
2. Navigate to Pages (in the left sidebar)
3. Under "Source", select "GitHub Actions"
4. Push to the main branch to trigger the deployment

## How It Works

### Step-by-Step Mechanics

1. **Initialization**:
   - Grid starts in a uniform state (all cells = +1 or -1)
   - Center cell is selected as the "ignition point"

2. **Ignition**:
   - Center cell flips state (creating the first "seam")
   - Becomes "active" and attempts to propagate

3. **Propagation Wave**:
   - For each active cell:
     - Flips its own state immediately
     - Checks all 4 neighbors (with toroidal wrapping)
     - For each neighbor in the **old state**:
       - Calculates probability: `P = 1 - (k* - bias)`
       - Propagates if `random() < P`
   - Newly activated cells join the next wave

4. **Cascading**:
   - Wave continues spreading outward
   - Some cells flip, creating new seams
   - Some cells resist, creating boundaries
   - Patterns emerge: waves, fronts, eddies

5. **Resolution** (Annihilation):
   - When no more cells can propagate
   - Ideal case: entire grid reaches uniform state
   - Real case: may stabilize with multiple domains
   - **Coherence metric** measures progress: `|count(+1) - count(-1)| / total`

### Visual Metaphors

The demo uses intuitive analogies:
- **Red vs Blue**: Two competing "opinions" or states
- **Glowing cells**: Active propagation (the "doubt" spreading)
- **Coherence bar**: How close to complete agreement
- **Step counter**: Time evolution (discrete steps)

### Key Observables

- **Wave speed**: How fast does the cascade spread?
- **Wave width**: How many cells are active simultaneously?
- **Annihilation time**: How many steps until resolution?
- **Cascade efficiency**: What % of neighbors actually flip?
- **Pattern formation**: Do you see spirals, fronts, or chaos?

Try the **"Critical Threshold"** example (bias = 0, k* at transition): Run it multiple times and you'll see wildly different outcomes—this is the **edge of chaos** where small fluctuations determine fate!

## GitHub Codespaces

This repository is configured to work with GitHub Codespaces:

1. Click the "Code" button and select "Create codespace on main"
2. Wait for the environment to build (this may take a few minutes on first launch)
3. The dev server starts automatically in the background
4. Check the **PORTS** tab to see port 3000 forwarded
5. Click the globe icon next to port 3000 to open the app

**Troubleshooting Codespaces:**
- **Dev server logs**: View logs at `/tmp/vite-dev.log` or run `npm run dev` manually
- **App URL**: `http://localhost:3000/Seam-Lattice/` (note the base path)
- **Restart server**: Kill existing process and run `npm run dev`
- **Port forwarding**: Port 3000 should auto-forward (check PORTS tab)

## Example Library

The demo includes **8 pedagogical examples** designed to teach core concepts progressively:

1. **⚡ First Ignition**: Basic cascade from center—your intro to seam propagation
2. **✓ Guaranteed Resolution**: High bias ensures complete cascade (always succeeds)
3. **⚠️ Critical Threshold**: Balanced at k*—cascades are unpredictable (phase transition)
4. **🔄 Edge Wrapping Demo**: See toroidal topology in action (no boundaries!)
5. **🐌 Slow Cascade**: Low bias, slow animation—watch every decision
6. **💥 Fast Takeover**: High bias, rapid spread—explosive cascade
7. **📊 Large Grid Exploration**: Patterns emerge at scale (35×35 grid)
8. **🎲 Chaos to Order**: Start randomized—watch self-organization

Each example includes:
- Pre-configured parameters (grid size, k*, bias, delay)
- Setup instructions
- Expected outcomes
- **Learning goals** (what you should understand after trying it)

See [`examples.ts`](examples.ts) for implementation details.

## Technology Stack

- **React 18** with TypeScript for type-safe UI components
- **Vite** for lightning-fast build tooling and HMR
- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Pure JavaScript** for simulation logic (no external physics libraries)
- **Zero backend**: Runs entirely client-side, fully offline-capable

## Project Structure

```
Seam-Lattice/
├── components/          # React UI components
│   ├── Grid.tsx        # Main lattice visualization
│   ├── SimulationControls.tsx  # Parameter controls
│   ├── MetricsPanel.tsx        # Real-time statistics
│   └── InfoPanel.tsx           # Theory explanations
├── utils/              # Core simulation logic
│   ├── lattice.ts      # Propagation algorithms
│   └── metrics.ts      # Coherence calculations
├── examples.ts         # Pedagogical example library
├── types.ts            # TypeScript definitions
├── App.tsx             # Main application
└── PEDAGOGICAL_ROADMAP.md  # Future enhancement plans
```

## Contributing

We welcome contributions! Here's how to help elevate this to 10/10:

### Quick Contributions
- 📸 **Add screenshots/GIFs**: Capture cool propagation patterns
- 📝 **Improve docs**: Clarify theory, add more examples
- 🐛 **Report bugs**: Open issues for any glitches
- 💡 **Suggest features**: What would make this more useful?

### Medium Contributions
- 🎨 **New visualization modes**: Heatmaps, probability overlays, wave patterns
- 🧪 **Add tests**: Unit tests for propagation logic
- ♿ **Accessibility**: Keyboard navigation, screen reader support
- 📱 **Mobile optimization**: Better touch controls

### Advanced Contributions
- 🤖 **ML integrations**: Neural network seam detection, real data import
- 📊 **Export functionality**: Save states as JSON/PNG, shareable links
- 🔬 **Research mode**: Batch simulations, parameter sweeps, statistical analysis
- 🎓 **Tutorial system**: Guided walkthrough for first-time users

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

See [PEDAGOGICAL_ROADMAP.md](PEDAGOGICAL_ROADMAP.md) for our full vision of educational enhancements.

## Roadmap & Future Work

**Phase 1 (Current)**: ✅ Basic visualization, example library, pedagogical foundation

**Phase 2 (Next)**:
- 3D torus visualization mode
- Advanced metrics dashboard (wave velocity, efficiency, prediction)
- Comparative split-screen mode (A/B parameter testing)

**Phase 3 (Stretch)**:
- Seam-aware neural network integration (toy models)
- Real dataset import (CSV/JSON) for regime detection
- Export simulation data for external analysis

**Phase 4 (Research)**:
- Custom propagation rules (beyond binary states)
- Batch simulation runner with statistical tools
- Connection to ongoing consciousness research

## Join the Seam Revolution! 🚀

**Seeking collaborators in:**
- 🧠 Neuroscience (hippocampal models, phase precession)
- 🤖 Machine Learning (seam-aware architectures, regime detection)
- 🧮 Applied Math (topology, percolation theory, dynamical systems)
- 🎓 Education (pedagogy, interactive learning, science communication)
- 💻 Web Development (React, TypeScript, data visualization)

**Interested?**
- ⭐ Star this repo to follow progress
- 🍴 Fork it to experiment with your own ideas
- 💬 Open an issue to start a discussion
- 📧 Reach out via GitHub Discussions or Issues

Let's build tools that help us understand how understanding itself works!

## Citation & Academic Use

If you use this visualization in research, teaching, or presentations, please cite:

```bibtex
@software{seam_lattice_2026,
  author = {MacMayo1993},
  title = {Seam Lattice Visualizer: Interactive Exploration of Non-Orientable Topology and Discrete Phase Transitions},
  year = {2026},
  url = {https://github.com/MacMayo1993/Seam-Lattice},
  note = {Interactive web-based visualization demonstrating seam propagation, percolation theory, and cognitive phase transitions}
}
```

## License

This project is licensed under the **MIT License**—see [LICENSE](LICENSE) for details.

Free to use, modify, and distribute. If you build something cool with it, let us know!

## Resources & Further Reading

**Topology & Percolation:**
- Stauffer & Aharony (1994): *Introduction to Percolation Theory*
- Grimmett (1999): *Percolation* (comprehensive mathematical treatment)

**Neuroscience:**
- O'Keefe & Recce (1993): Phase relationship between hippocampal place units and the EEG theta rhythm
- Buzsáki & Moser (2013): Memory, navigation and theta rhythm in the hippocampal-entorhinal system

**Machine Learning & Information Theory:**
- Rissanen (1978): Modeling by shortest data description (MDL principle)
- Tishby & Zaslavsky (2015): Deep learning and the information bottleneck principle

**Philosophy of Mind:**
- Chalmers (1995): Facing Up to the Problem of Consciousness
- Tononi (2004): An information integration theory of consciousness

**Related Projects:**
- NetLogo: Agent-based modeling platform with similar cellular automata
- Complexity Explorables: Interactive explorations of complex systems
- Seeing Theory: Visual introduction to probability and statistics

---

**Built with curiosity in Red Oak, NC 🌳**

*Last updated: January 19, 2026*
