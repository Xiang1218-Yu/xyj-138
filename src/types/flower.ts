export interface Petal {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  color: string;
  opacity: number;
  rotation: number;
  swayOffset: number;
}

export interface Flower {
  id: string;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  petals: Petal[];
  centerColor: string;
  petalColor: string;
  size: number;
  bloomProgress: number;
  createdAt: number;
  swayPhase: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'petal' | 'sparkle' | 'trail';
  rotation: number;
  rotationSpeed: number;
}

export interface StarParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export interface StemPoint {
  x: number;
  y: number;
  thickness: number;
}

export interface Leaf {
  x: number;
  y: number;
  angle: number;
  size: number;
  side: 'left' | 'right';
  growProgress: number;
}

export interface Stem {
  id: string;
  points: StemPoint[];
  color: string;
  leaves: Leaf[];
  growProgress: number;
  targetGrowProgress: number;
}

export interface GardenState {
  flowers: Flower[];
  particles: Particle[];
  stars: StarParticle[];
  stems: Stem[];
  selectedColor: string;
  flowerSize: number;
  isDrawing: boolean;
  lastMousePos: { x: number; y: number };
  currentStem: Stem | null;
}
