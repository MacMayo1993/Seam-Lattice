# Seam Lattice Visualizer

An interactive visualization of non-orientable topology and state propagation through a 2D lattice. This project demonstrates how conflicting states can cascade through a grid until reaching resolution.

## Features

- Interactive grid visualization with real-time state propagation
- Adjustable simulation parameters (grid size, threshold, bias)
- Visual representation of "seam" propagation and state coherence
- Clean, modern UI with responsive design
- No external API dependencies

## Live Demo

View the live demo: [https://macmayo1993.github.io/Seam-Lattice/](https://macmayo1993.github.io/Seam-Lattice/)

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

The visualizer demonstrates a lattice-based model where:
- Each cell has one of two states (represented as +1 or -1)
- Starting from the center, a "seam" propagates through the grid
- Neighboring cells flip state based on probability and propagation bias
- The simulation continues until all propagations complete
- "Resolution" is achieved when the entire grid reaches a uniform state

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

## Technology Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- No external APIs or backend required
