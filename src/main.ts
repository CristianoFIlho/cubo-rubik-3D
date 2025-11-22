import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import './style.css';
import { Cube } from './Cube';
import { Controls } from './Controls';
import { Solver } from './Solver';

const app = document.querySelector<HTMLDivElement>('#app')!;

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 5, 7);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
backLight.position.set(-10, -10, -10);
scene.add(backLight);

// Helpers (optional)
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// Cube
const cube = new Cube(scene);

// Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;

// Controls instance sets up event listeners in constructor
const _controls = new Controls(camera, scene, cube, orbitControls);
const solver = new Solver(cube);

// Link cube moves to solver state
cube.onRotate = (move) => {
    solver.trackMove(move);
};

// UI Event Listeners
document.querySelectorAll('button[data-move]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const move = (e.target as HTMLElement).dataset.move;
        if (move) cube.rotate(move);
    });
});

document.getElementById('btn-scramble')?.addEventListener('click', () => {
    cube.scramble();
});

document.getElementById('btn-solve')?.addEventListener('click', () => {
    solver.solve();
});

// Animation Loop
function animate(time: number) {
    requestAnimationFrame(animate);
    
    TWEEN.update(time);
    orbitControls.update();
    
    renderer.render(scene, camera);
}

animate(0);

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

