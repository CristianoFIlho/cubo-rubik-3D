declare module 'cubejs' {
    export default class Cube {
        constructor(state?: string);
        static initSolver(): void;
        move(move: string): void;
        solve(): string;
        asString(): string;
        randomize(): void;
    }
}

