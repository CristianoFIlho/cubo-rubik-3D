import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Cube } from './Cube';

export class Controls {
    camera: THREE.Camera;
    scene: THREE.Scene;
    cube: Cube;
    orbitControls: OrbitControls;
    
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    
    isDragging: boolean = false;
    startPoint: { x: number, y: number } | null = null;
    intersectedCubie: THREE.Intersection | null = null;

    constructor(camera: THREE.Camera, scene: THREE.Scene, cube: Cube, orbitControls: OrbitControls) {
        this.camera = camera;
        this.scene = scene;
        this.cube = cube;
        this.orbitControls = orbitControls;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.initEvents();
    }

    initEvents() {
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('touchstart', this.onTouchStart.bind(this));
        window.addEventListener('touchmove', this.onTouchMove.bind(this));
        window.addEventListener('touchend', this.onTouchEnd.bind(this));
    }

    getIntersects(event: MouseEvent | TouchEvent) {
        let clientX, clientY;
        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = (event as MouseEvent).clientX;
            clientY = (event as MouseEvent).clientY;
        }

        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Intersect only with cubies
        return this.raycaster.intersectObjects(this.cube.cubies);
    }

    onMouseDown(event: MouseEvent) {
        if (this.cube.isAnimating) return;
        // Don't trigger if clicking UI
        if ((event.target as HTMLElement).tagName === 'BUTTON') return;

        const intersects = this.getIntersects(event);
        if (intersects.length > 0) {
            this.isDragging = true;
            this.orbitControls.enabled = false; // Disable camera rotation while dragging a slice
            this.intersectedCubie = intersects[0];
            this.startPoint = { x: event.clientX, y: event.clientY };
        }
    }

    onTouchStart(event: TouchEvent) {
         if (this.cube.isAnimating) return;
         if ((event.target as HTMLElement).tagName === 'BUTTON') return;

        const intersects = this.getIntersects(event);
        if (intersects.length > 0) {
            this.isDragging = true;
            this.orbitControls.enabled = false;
            this.intersectedCubie = intersects[0];
            this.startPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
    }

    onMouseMove(_event: MouseEvent) {
        if (!this.isDragging) return;
        // Visualization of drag could go here
    }

    onTouchMove(_event: TouchEvent) {
        if (!this.isDragging) return;
    }

    onMouseUp(event: MouseEvent) {
        this.handleDragEnd(event.clientX, event.clientY);
    }

    onTouchEnd(_event: TouchEvent) {
         if (!this.startPoint) return;
         // We can't get clientX from touchend usually, so we might need to track last move
         // simplified: just rely on the fact that if we lifted, we are done.
         // But we need coordinates.
         // This implementation is simplified for Mouse mostly. 
         this.isDragging = false;
         this.orbitControls.enabled = true;
         this.startPoint = null;
         this.intersectedCubie = null;
    }

    handleDragEnd(endX: number, endY: number) {
        if (!this.isDragging || !this.startPoint || !this.intersectedCubie) {
            this.isDragging = false;
            this.orbitControls.enabled = true;
            return;
        }

        const dx = endX - this.startPoint.x;
        const dy = endY - this.startPoint.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 20) {
            // Click, not drag. Do nothing or maybe select?
            this.isDragging = false;
            this.orbitControls.enabled = true;
            return;
        }

        // Determine direction
        // We need to know the face normal to know how 2D drag maps to 3D rotation
        const normal = this.intersectedCubie.face!.normal;
        // Transform normal to world space to check orientation relative to camera? 
        // Actually, the normal returned by raycaster is usually in object space if world matrix isn't applied? 
        // Three.js raycaster intersects returns face normal.
        // But the object is rotated. We need to be careful.
        
        // Simplified logic:
        // Calculate drag vector
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // We need to determine which axis to rotate around based on the face clicked and drag direction.
        // This is complex in full 3D.
        // For MVP, let's use a heuristic based on normal.
        
        // Transform normal to world space
        const worldNormal = normal.clone().applyQuaternion(this.intersectedCubie.object.quaternion).normalize();
        
        // Determine which face we are looking at roughly
        // 0 = R, 1 = L, 2 = U, 3 = D, 4 = F, 5 = B
        
        // Heuristic:
        // If normal is mostly X (Right/Left face):
        //    - Drag Vertical (dy) -> Rotate Z (Front/Back slices)
        //    - Drag Horizontal (dx) -> Rotate Y (Up/Down slices)
        // If normal is mostly Y (Up/Down face):
        //    - Drag Vertical (dy) -> Rotate X (Right/Left slices)
        //    - Drag Horizontal (dx) -> Rotate Z (Front/Back slices)
        // If normal is mostly Z (Front/Back face):
        //    - Drag Vertical (dy) -> Rotate X (Right/Left slices)
        //    - Drag Horizontal (dx) -> Rotate Y (Up/Down slices)

        let move = '';
        
        // Check dominant axis of normal
        const nx = Math.abs(worldNormal.x);
        const ny = Math.abs(worldNormal.y);
        const nz = Math.abs(worldNormal.z);

        // Get intersected object position to know which slice
        // Note: object.position is the current position
        const pos = this.intersectedCubie.object.position;

        if (nx > ny && nx > nz) { // Side faces (R/L)
             if (absDy > absDx) {
                 // Vertical Drag -> Rotate Front/Standing (Z-axisish rotation logic, but actually rotating the slice around X?)
                 // Wait. If I am looking at Right face, dragging up/down moves the slice around Z axis (Front face style rotation but deeper)
                 // No, dragging Right face up means rotating the Right slice around X axis? No.
                 // If I drag Right face UP, I am rotating the Right slice around Z axis? No, around X axis.
                 // Wait, rotating Right face around X axis is essentially rotating the Right Face itself.
                 // Rotating Right face around Z axis is NOT possible for just that face without breaking cube?
                 // Ah, "Right Face" rotation (R) is rotating around X axis.
                 // So if I drag vertical on Right face, I expect R or R'.
                 
                 // Let's stick to standard notation.
                 // R move rotates around X axis.
                 // U move rotates around Y axis.
                 // F move rotates around Z axis.
                 
                 // On Right Face (Normal X):
                 // Drag Vertical (Y change) -> Rotates around Z? No.
                 // If I swipe up on Right face, I want to trigger R (or R'). R is rotation around X.
                 // So Drag Vertical -> Axis X.
                 // If I swipe Horizontal (Z change visually) -> Axis Y? (U/D slice).
                 
                 if (absDy > absDx) { // Vertical Drag on Side Face -> Rotate that face (X axis)
                     move = (dy > 0) ? (worldNormal.x > 0 ? "R'" : "L") : (worldNormal.x > 0 ? "R" : "L'"); 
                     // dy > 0 means dragged down (screen coords Y increases down).
                     // Drag down on R face -> R' (counter-clockwise if looking from right? R is clockwise).
                     // R move: top goes back.
                     // Drag down: top goes back? Visualizing...
                     // Let's just map one and flip if wrong.
                 } else { // Horizontal Drag on Side Face -> Rotate Y axis (U/D/E)
                     // Check y height
                     if (pos.y > 0.5) move = (dx > 0) ? "U'" : "U"; // Top layer
                     else if (pos.y < -0.5) move = (dx > 0) ? "D" : "D'"; // Bottom layer
                     // else move E... ignore for now
                 }
             }
        } else if (ny > nx && ny > nz) { // Top/Bottom faces (U/D)
            if (absDy > absDx) { // Vertical Drag -> Rotate X axis (R/L/M)
                 if (pos.x > 0.5) move = (dy > 0) ? "R" : "R'";
                 else if (pos.x < -0.5) move = (dy > 0) ? "L'" : "L";
            } else { // Horizontal Drag -> Rotate Z axis (F/B/S)
                 if (pos.z > 0.5) move = (dx > 0) ? "F'" : "F";
                 else if (pos.z < -0.5) move = (dx > 0) ? "B" : "B'";
            }
        } else { // Front/Back faces (F/B)
            if (absDy > absDx) { // Vertical Drag -> Rotate X axis (R/L/M)
                 if (pos.x > 0.5) move = (dy > 0) ? "R" : "R'";
                 else if (pos.x < -0.5) move = (dy > 0) ? "L'" : "L";
            } else { // Horizontal Drag -> Rotate Y axis (U/D/E)
                 if (pos.y > 0.5) move = (dx > 0) ? "U'" : "U";
                 else if (pos.y < -0.5) move = (dx > 0) ? "D" : "D'";
            }
        }

        if (move) {
            this.cube.rotate(move);
        }

        this.isDragging = false;
        this.orbitControls.enabled = true;
        this.startPoint = null;
        this.intersectedCubie = null;
    }
}

