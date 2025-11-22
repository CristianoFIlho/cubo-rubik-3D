import Cube from 'cubejs';
import { Cube as ThreeCube } from './Cube';

// Initialize the solver tables (this might take a moment)
Cube.initSolver();

export class Solver {
    threeCube: ThreeCube;
    logicCube: any; // cubejs instance

    constructor(threeCube: ThreeCube) {
        this.threeCube = threeCube;
        this.logicCube = new Cube(); // Defaults to solved state
    }

    // Call this whenever a move is performed on the 3D cube
    trackMove(move: string) {
        // cubejs uses standard notation.
        this.logicCube.move(move);
    }

    async solve() {
        // Get solution string
        const solution = this.logicCube.solve();
        // solution is a string like "U R F' ..."
        console.log("Solution:", solution);

        if (solution === 'Error 1') {
             console.log("Already solved or invalid state");
             return;
        }

        const moves = solution.split(' ').filter((m: string) => m.length > 0);
        
        // The solver returns moves to SOLVE the cube.
        // We just need to apply them to the 3D cube.
        await this.threeCube.runSequence(moves, 300);
        
        // Reset logic cube state? No, if we applied the moves to 3D cube, we should also apply them to logic cube to keep it in sync.
        // Wait, if I run the sequence on 3D cube, I also need to update logicCube so it knows it's solved.
        // The `trackMove` should be called for these moves too?
        // Yes. But `threeCube.runSequence` calls `rotate`, so if we hook `rotate` to call `trackMove`, we are good.
        // BUT `trackMove` applies the move to `logicCube`. If `logicCube` generated the solution, applying the solution moves to it should bring it to identity.
    }
}

