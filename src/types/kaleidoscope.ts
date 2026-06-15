export type SymmetryMode = 'mirror' | 'rotate' | 'mirrorRotate';

export type ColorMode = 'solid' | 'gradient' | 'rainbow';

export interface GradientColor {
  color1: string;
  color2: string;
}

export interface KaleidoscopeStroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  colorMode: ColorMode;
  gradientColors?: GradientColor;
}

export interface Point {
  x: number;
  y: number;
}

export interface KaleidoscopeState {
  symmetryAxes: number;
  symmetryMode: SymmetryMode;
  brushSize: number;
  strokeColor: string;
  strokeColorMode: ColorMode;
  strokeGradientColors: GradientColor;
  backgroundColor: string;
  backgroundColorMode: ColorMode;
  backgroundGradientColors: GradientColor;
  showGuides: boolean;
  strokes: KaleidoscopeStroke[];
  currentStroke: KaleidoscopeStroke | null;
  isDrawing: boolean;
  rotation: number;
  animateRotation: boolean;
  rotationSpeed: number;
}

export const defaultKaleidoscopeState: KaleidoscopeState = {
  symmetryAxes: 6,
  symmetryMode: 'mirrorRotate',
  brushSize: 4,
  strokeColor: '#ff6b6b',
  strokeColorMode: 'solid',
  strokeGradientColors: {
    color1: '#ff6b6b',
    color2: '#4ecdc4',
  },
  backgroundColor: '#0f0f23',
  backgroundColorMode: 'solid',
  backgroundGradientColors: {
    color1: '#1a1a2e',
    color2: '#16213e',
  },
  showGuides: false,
  strokes: [],
  currentStroke: null,
  isDrawing: false,
  rotation: 0,
  animateRotation: false,
  rotationSpeed: 0.5,
};
