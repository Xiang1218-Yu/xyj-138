export interface FluidParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  r: number;
  g: number;
  b: number;
  size: number;
  life: number;
  maxLife: number;
  viscosity: number;
}

export interface BlobForce {
  x: number;
  y: number;
  radius: number;
  strength: number;
  type: 'blow' | 'suck' | 'pour';
}

export interface FluidState {
  particles: FluidParticle[];
  selectedColor: string;
  viscosity: number;
  flowRate: number;
  brushSize: number;
  blowStrength: number;
  isPouring: boolean;
  isBlowing: boolean;
  tool: 'pour' | 'blow' | 'mix';
  backgroundColor: string;
}

export const defaultFluidState: FluidState = {
  particles: [],
  selectedColor: '#ff6b6b',
  viscosity: 50,
  flowRate: 70,
  brushSize: 40,
  blowStrength: 60,
  isPouring: false,
  isBlowing: false,
  tool: 'pour',
  backgroundColor: '#1a1a2e',
};
