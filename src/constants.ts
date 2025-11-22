export const CUBE_SIZE = 1;
export const SPACING = 0.05;
export const TOTAL_SIZE = (CUBE_SIZE + SPACING) * 3;

export const COLORS = {
  U: 0xFFFFFF, // Up - White
  D: 0xFFFF00, // Down - Yellow
  L: 0xFF8800, // Left - Orange (Standard orientation: F=Green, U=White -> L=Orange)
  R: 0xFF0000, // Right - Red
  F: 0x00FF00, // Front - Green
  B: 0x0000FF, // Back - Blue
  CORE: 0x222222 // Inner color
};

export enum FACE {
    RIGHT = 0,
    LEFT = 1,
    UP = 2,
    DOWN = 3,
    FRONT = 4,
    BACK = 5
}

