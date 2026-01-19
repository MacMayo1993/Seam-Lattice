# Contributing to Seam Lattice Visualizer

First off, thank you for considering contributing to Seam Lattice! This project aims to make complex theoretical concepts (non-orientable topology, phase transitions, cognitive seams) accessible and interactive. Your contributions help make that vision a reality.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Adding Examples](#adding-examples)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project is driven by curiosity and collaboration. We expect:

- **Respectful discourse**: Disagree with ideas, not people
- **Constructive feedback**: Focus on improvement, not criticism
- **Open-minded exploration**: This is research—no idea is too wild
- **Academic integrity**: Cite sources, give credit, share knowledge

## How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? Help us squash it!

**Before submitting:**
1. Check [existing issues](https://github.com/MacMayo1993/Seam-Lattice/issues) to avoid duplicates
2. Try to reproduce the bug in the [live demo](https://macmayo1993.github.io/Seam-Lattice/)
3. Note your browser, OS, and steps to reproduce

**Submit via:**
- [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)

**Include:**
- Clear title (e.g., "Grid fails to render on Safari 15")
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console errors (open DevTools → Console)

### 💡 Suggesting Features

Have an idea to make this better?

**Good feature requests:**
- Solve a real problem or add pedagogical value
- Align with the project's theoretical goals
- Are specific and actionable

**Submit via:**
- [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)

**Examples of great requests:**
- "Add heatmap mode to visualize wave propagation speed"
- "Allow exporting simulation data as JSON"
- "Create tutorial mode for first-time users"

### 📝 Improving Documentation

Documentation is as important as code!

**Help needed with:**
- Clarifying theoretical explanations in `README.md`
- Adding code comments to complex algorithms
- Expanding `PEDAGOGICAL_ROADMAP.md` with new ideas
- Creating tutorials or blog posts

**Small fixes** (typos, formatting): Submit a PR directly
**Large changes** (restructuring, new sections): Open an issue first to discuss

### 🎨 Contributing Code

Ready to dive into the codebase? Awesome!

**Good first issues:**
- Look for `good first issue` label
- Small, well-defined tasks
- Great for getting familiar with the codebase

**Areas needing help:**
- Accessibility (keyboard nav, ARIA labels)
- Mobile optimization (touch controls, responsive layout)
- Performance (large grids, animation smoothness)
- New visualization modes (see `PEDAGOGICAL_ROADMAP.md`)

## Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- Modern browser (Chrome, Firefox, Safari, Edge)

### Local Development

1. **Fork and clone:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Seam-Lattice.git
   cd Seam-Lattice
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   App will open at `http://localhost:3000`

4. **Make changes:**
   - Edit files in `components/`, `utils/`, or root
   - Hot reload will update automatically

5. **Test your changes:**
   - Manually test in browser
   - Run linter: `npm run lint` (if configured)
   - Check TypeScript: `npx tsc --noEmit`

6. **Build for production:**
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

### GitHub Codespaces

Prefer cloud development?

1. Click "Code" → "Create codespace on main"
2. Wait for environment to build (auto-starts dev server)
3. Check **PORTS** tab, click globe icon next to port 3000
4. Develop in VS Code in your browser!

## Project Structure

```
Seam-Lattice/
├── components/              # React UI components
│   ├── Grid.tsx            # Main lattice visualization
│   ├── Cell.tsx            # Individual cell component
│   ├── SimulationControls.tsx  # Parameter sliders, buttons
│   ├── MetricsPanel.tsx    # Real-time stats display
│   ├── InfoPanel.tsx       # Theory explanations, help modal
│   └── ExampleSelector.tsx # Pedagogical example picker
├── utils/                  # Core simulation logic
│   ├── lattice.ts          # Propagation algorithms, state management
│   ├── metrics.ts          # Coherence, entropy calculations
│   └── constants.ts        # k*, default params
├── examples.ts             # Pedagogical example library
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main application component
├── index.tsx               # Entry point
├── vite.config.ts          # Vite build configuration
└── tailwind.config.js      # Tailwind CSS config (if exists)
```

## Coding Guidelines

### TypeScript

- **Use types everywhere**: No `any` unless absolutely necessary
- **Define interfaces**: See `types.ts` for examples
- **Prefer `const` over `let`**: Immutability by default

### React

- **Functional components**: Use hooks, not class components
- **Keep components focused**: Single responsibility principle
- **Extract reusable logic**: Custom hooks for shared state

### Naming Conventions

- **Components**: PascalCase (`Grid.tsx`, `InfoPanel.tsx`)
- **Functions**: camelCase (`calculateCoherence`, `propagateSeam`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_GRID_SIZE`, `CRITICAL_K`)
- **Interfaces/Types**: PascalCase (`SimulationConfig`, `CellState`)

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings (`'hello'`)
- **Semicolons**: Use them consistently
- **Line length**: Keep under 100 characters when possible

### Comments

- **Explain WHY, not WHAT**: Code should be self-documenting
- **Complex algorithms**: Add step-by-step explanations
- **TODOs**: Use `// TODO: description` format
- **Theoretical connections**: Link to equations, papers, concepts

Example:
```typescript
// Calculate coherence using normalized state difference
// Coherence = |N(+1) - N(-1)| / total
// Range: [0, 1] where 1 = perfect order, 0 = maximum disorder
const coherence = Math.abs(countPlus - countMinus) / total;
```

## Adding Examples

Want to add a new pedagogical example? Great!

### Steps

1. **Open `examples.ts`**
2. **Add a new object to the `EXAMPLES` array:**

```typescript
{
  id: 'my-new-example',  // Unique slug
  name: 'My New Example',  // Display name
  description: 'Brief description of what this demonstrates',
  icon: '🔥',  // Emoji icon
  config: {
    gridSize: 21,          // Odd numbers recommended (center cell)
    thresholdK: 0.618,     // Critical threshold
    propagationBias: 0.2,  // 0 = critical, higher = more spread
    delay: 100,            // Animation delay (ms)
  },
  setupInstructions: 'Tell user what to do (e.g., "Click Ignite and watch corners")',
  expectedOutcome: 'What should happen (e.g., "Rapid cascade from edges")',
  learningGoal: 'What concept this teaches (e.g., "Edge effects in toroidal topology")'
}
```

3. **Test it:**
   - Run dev server
   - Select your example from dropdown
   - Verify behavior matches description

4. **Document it:**
   - Add to list in README if it's a major addition

### Example Ideas

- **Different grid sizes**: 7×7 (tiny), 51×51 (huge)
- **Extreme bias**: 0.9 (almost guaranteed spread), 0.01 (almost never spreads)
- **Interesting patterns**: Try to create spirals, fractal-like boundaries, etc.
- **Edge cases**: What happens at bias = 1.0? Grid size = 3?

## Testing

### Manual Testing Checklist

Before submitting a PR, test these scenarios:

- [ ] Simulation runs without errors
- [ ] All examples load correctly
- [ ] Parameter sliders update visualization
- [ ] Ignite/Reset/Pause buttons work
- [ ] Metrics update in real-time
- [ ] Responsive on mobile (if relevant to your change)
- [ ] No console errors or warnings
- [ ] Accessibility: Can you navigate with Tab key?

### Future: Automated Testing

We plan to add:
- Unit tests for propagation logic (Jest)
- Component tests (React Testing Library)
- E2E tests (Playwright or Cypress)

**Want to help?** Open an issue: "Add test infrastructure"

## Documentation

### Code Documentation

- **Complex functions**: Add JSDoc comments
  ```typescript
  /**
   * Calculates mutual information between forward and backward flows
   * @param forward - Forward propagation entropy
   * @param backward - Backward propagation entropy
   * @returns Mutual information in bits
   */
  function mutualInfo(forward: number, backward: number): number {
    // ...
  }
  ```

### README Updates

If your PR:
- Adds a major feature → Update README "Features" section
- Changes setup → Update "Run Locally" section
- Adds dependencies → Update "Technology Stack"

### PEDAGOGICAL_ROADMAP.md

For pedagogical enhancements:
- Check if it's already in the roadmap
- If implemented, mark with ✅
- If adding something new, propose it in "Open Questions"

## Pull Request Process

### Before You Submit

1. **Test thoroughly** (see checklist above)
2. **Update documentation** (README, code comments)
3. **Check for TypeScript errors**: `npx tsc --noEmit`
4. **Clean commit history**: Squash WIP commits if needed

### Submitting

1. **Push to your fork**:
   ```bash
   git checkout -b feature/my-awesome-feature
   git commit -m "feat: Add awesome feature"
   git push origin feature/my-awesome-feature
   ```

2. **Open a Pull Request**:
   - Base branch: `main` (or current development branch)
   - Clear title: `feat: Add heatmap visualization mode`
   - Description:
     - What does this PR do?
     - Why is it needed?
     - How to test it
     - Screenshots (if UI change)

3. **Respond to feedback**:
   - Address review comments promptly
   - Push updates to the same branch
   - Don't force-push after review starts (unless requested)

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code restructuring (no behavior change)
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
- `feat: Add probability overlay visualization mode`
- `fix: Grid not rendering on Safari 15`
- `docs: Clarify k* calculation in README`

### Review Process

- Maintainers will review within **1-3 days** (we're small, be patient!)
- Feedback will be constructive and focused on improvement
- Once approved and CI passes (when implemented), we'll merge

### After Merge

- Your PR will be deployed to GitHub Pages automatically
- You'll be added to contributors list (if not already)
- Star the repo and share it to spread the word!

## Recognition

All contributors will be recognized! Ways we celebrate contributions:

- Listed in GitHub Contributors
- Mentioned in release notes for significant features
- Potential co-authorship on future papers/publications if contributions are substantial

## Questions?

- **General questions**: Open a [GitHub Discussion](https://github.com/MacMayo1993/Seam-Lattice/discussions)
- **Specific to a bug/feature**: Comment on the relevant issue
- **Private inquiries**: Open an issue and mention you'd like to discuss privately

---

## Philosophy of Contribution

This project is **research made interactive**. We value:

1. **Theoretical rigor**: Ensure new features align with the underlying theory
2. **Pedagogical value**: Does this help someone learn or understand better?
3. **Simplicity**: Prefer clear, readable code over clever tricks
4. **Accessibility**: Can everyone engage with this, regardless of background?

When in doubt, ask! We're all learning together.

**Thank you for contributing to the Seam Revolution! 🚀**

---

*Last updated: January 19, 2026*
