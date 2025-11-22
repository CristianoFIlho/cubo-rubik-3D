# Rubik's Cube 3D

A fully interactive 3D Rubik's Cube built with [Three.js](https://threejs.org/) and [Vite](https://vitejs.dev/). This project features a realistic 3D cube, mouse controls, UI buttons for manual rotation, and an integrated auto-solver.

## Features

- **Interactive 3D Cube**: Rotate the entire cube to view from any angle using OrbitControls.
- **Mouse Drag Interaction**: Click and drag on any face to rotate the corresponding layer (Standard heuristic detection).
- **Manual UI Controls**: Buttons for standard Rubik's Cube notation moves (U, D, L, R, F, B and primes).
- **Scramble**: Randomly scramble the cube with a sequence of 20 moves.
- **Auto-Solve**: Integrates `cubejs` to calculate the solution and animates the cube back to its solved state.
- **Smooth Animations**: Powered by `tween.js` for fluid layer rotations.

## Tech Stack

- **Framework**: Vanilla TypeScript with Vite
- **3D Library**: Three.js
- **Animation**: @tweenjs/tween.js
- **Solver**: cubejs

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cubo-rubik.git
   cd cubo-rubik
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173` (or the port shown in the terminal).

## Controls

- **Rotate View**: Left-click and drag background.
- **Rotate Layers (Mouse)**: Click a cube face and drag in the direction of the desired turn.
    - Vertical drag on side faces rotates R/L layers.
    - Horizontal drag on side faces rotates U/D layers.
- **Rotate Layers (UI)**: Use the on-screen buttons for precise control.
- **Scramble**: Click the "Scramble" button to mix up the cube.
- **Solve**: Click "Solve" to watch the cube solve itself.

## Project Structure

- `src/main.ts`: Entry point, scene setup, and animation loop.
- `src/Cube.ts`: Manages the 3D geometry, state, and rotation animations.
- `src/Controls.ts`: Handles mouse inputs and raycasting for user interaction.
- `src/Solver.ts`: Bridges the 3D cube state with the solving algorithm.
- `src/constants.ts`: Configuration constants (Colors, Sizes).

## Deployment to Vercel

This project is configured for easy deployment to Vercel.

### Quick Deploy

Deploy without installing anything globally:

```bash
npx vercel
```

For production:
```bash
npx vercel --prod
```

### GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project" and import your repository
4. Vercel will auto-detect settings from `vercel.json`
5. Click "Deploy"

See `DEPLOY.md` for detailed deployment instructions.

## License

MIT
