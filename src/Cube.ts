import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CUBE_SIZE, SPACING, COLORS } from './constants';

export class Cube {
    scene: THREE.Scene;
    cubies: THREE.Mesh[] = [];
    isAnimating: boolean = false;
    
    // Store logical state of the cube (simplified for now, physical position is truth)
    onRotate: ((move: string) => void) | null = null;
    
    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createGeometry();
    }

    createGeometry() {
        const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        
        // Create materials for each face
        // Order: Right (x+), Left (x-), Top (y+), Bottom (y-), Front (z+), Back (z-)
        const materials = [
            new THREE.MeshPhongMaterial({ color: COLORS.R }), // Right
            new THREE.MeshPhongMaterial({ color: COLORS.L }), // Left
            new THREE.MeshPhongMaterial({ color: COLORS.U }), // Top
            new THREE.MeshPhongMaterial({ color: COLORS.D }), // Bottom
            new THREE.MeshPhongMaterial({ color: COLORS.F }), // Front
            new THREE.MeshPhongMaterial({ color: COLORS.B }), // Back
        ];

        // Cubies are positioned from -1 to 1
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const materialArray = materials.map(m => m.clone());
                    
                    // Paint internal faces black
                    if (x < 1) materialArray[0] = new THREE.MeshPhongMaterial({ color: COLORS.CORE });
                    if (x > -1) materialArray[1] = new THREE.MeshPhongMaterial({ color: COLORS.CORE });
                    if (y < 1) materialArray[2] = new THREE.MeshPhongMaterial({ color: COLORS.CORE });
                    if (y > -1) materialArray[3] = new THREE.MeshPhongMaterial({ color: COLORS.CORE });
                    if (z < 1) materialArray[4] = new THREE.MeshPhongMaterial({ color: COLORS.CORE });
                    if (z > -1) materialArray[5] = new THREE.MeshPhongMaterial({ color: COLORS.CORE });

                    const mesh = new THREE.Mesh(geometry, materialArray);
                    
                    // Position with spacing
                    const offset = CUBE_SIZE + SPACING;
                    mesh.position.set(x * offset, y * offset, z * offset);
                    
                    // Store user data for logical identification if needed
                    mesh.userData = { 
                        initialPosition: new THREE.Vector3(x, y, z),
                        isCubie: true
                    };

                    this.scene.add(mesh);
                    this.cubies.push(mesh);
                }
            }
        }
    }

    // Rotation logic
    rotate(move: string, duration: number = 300): Promise<void> {
        if (this.isAnimating) return Promise.resolve();
        
        return new Promise((resolve) => {
            this.isAnimating = true;
            
            const axis = this.getAxisFromMove(move);
            const direction = move.includes("'") ? 1 : -1; // Standard Three.js rotation direction is counter-clockwise
            const layer = this.getLayerFromMove(move);
            
            // 1. Find cubies in the layer
            const activeCubies = this.cubies.filter(cubie => {
                // Use a small epsilon for float comparison
                const pos = cubie.position;
                const epsilon = 0.1;
                const offset = CUBE_SIZE + SPACING;
                
                if (axis === 'x') return Math.abs(pos.x - layer * offset) < epsilon;
                if (axis === 'y') return Math.abs(pos.y - layer * offset) < epsilon;
                if (axis === 'z') return Math.abs(pos.z - layer * offset) < epsilon;
                return false;
            });

            // Notify listener (e.g. solver)
            if (this.onRotate) this.onRotate(move);

            // 2. Create a pivot object
            const pivot = new THREE.Object3D();
            pivot.rotation.set(0, 0, 0);
            this.scene.add(pivot);

            // 3. Attach cubies to pivot
            activeCubies.forEach(cubie => {
                this.scene.remove(cubie);
                pivot.add(cubie);
            });

            // 4. Animate pivot
            const targetRotation = { value: 0 };
            const endRotation = Math.PI / 2 * direction;
            
            new TWEEN.Tween(targetRotation)
                .to({ value: endRotation }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(() => {
                    if (axis === 'x') pivot.rotation.x = targetRotation.value;
                    if (axis === 'y') pivot.rotation.y = targetRotation.value;
                    if (axis === 'z') pivot.rotation.z = targetRotation.value;
                })
                .onComplete(() => {
                    // 5. Re-attach cubies to scene with new transforms
                    pivot.updateMatrixWorld();
                    activeCubies.forEach(cubie => {
                        cubie.updateMatrixWorld();
                        // Apply pivot's transform to cubie
                        const worldPos = new THREE.Vector3();
                        const worldQuat = new THREE.Quaternion();
                        const worldScale = new THREE.Vector3();
                        
                        cubie.getWorldPosition(worldPos);
                        cubie.getWorldQuaternion(worldQuat);
                        cubie.getWorldScale(worldScale);
                        
                        pivot.remove(cubie);
                        this.scene.add(cubie);
                        
                        cubie.position.copy(worldPos);
                        cubie.quaternion.copy(worldQuat);
                        cubie.scale.copy(worldScale);
                        
                        // Snap positions and rotations to clean values to avoid drift
                        this.snapCubie(cubie);
                    });
                    
                    this.scene.remove(pivot);
                    this.isAnimating = false;
                    resolve();
                })
                .start();
        });
    }

    snapCubie(cubie: THREE.Mesh) {
        const offset = CUBE_SIZE + SPACING;
        
        // Round positions to nearest multiple of offset or 0
        cubie.position.x = Math.round(cubie.position.x / offset) * offset;
        cubie.position.y = Math.round(cubie.position.y / offset) * offset;
        cubie.position.z = Math.round(cubie.position.z / offset) * offset;

        // Round rotation to nearest 90 degrees (PI/2)
        const euler = new THREE.Euler().setFromQuaternion(cubie.quaternion);
        euler.x = Math.round(euler.x / (Math.PI / 2)) * (Math.PI / 2);
        euler.y = Math.round(euler.y / (Math.PI / 2)) * (Math.PI / 2);
        euler.z = Math.round(euler.z / (Math.PI / 2)) * (Math.PI / 2);
        cubie.quaternion.setFromEuler(euler);
    }

    getAxisFromMove(move: string): 'x' | 'y' | 'z' {
        const face = move[0];
        if (['L', 'R'].includes(face)) return 'x';
        if (['U', 'D'].includes(face)) return 'y';
        if (['F', 'B'].includes(face)) return 'z';
        return 'y';
    }

    getLayerFromMove(move: string): number {
        const face = move[0];
        switch (face) {
            case 'R': return 1;
            case 'L': return -1;
            case 'U': return 1;
            case 'D': return -1;
            case 'F': return 1;
            case 'B': return -1;
            default: return 0;
        }
    }

    scramble() {
        const moves = ['U', 'D', 'L', 'R', 'F', 'B', "U'", "D'", "L'", "R'", "F'", "B'"];
        const sequence = [];
        for (let i = 0; i < 20; i++) {
            sequence.push(moves[Math.floor(Math.random() * moves.length)]);
        }
        this.runSequence(sequence, 100); // Fast animation
    }

    async runSequence(moves: string[], delay: number = 300) {
        for (const move of moves) {
            if (move.includes('2')) {
                const baseMove = move.replace('2', '');
                await this.rotate(baseMove, delay);
                await this.rotate(baseMove, delay);
            } else {
                await this.rotate(move, delay);
            }
        }
    }
}

