export interface Ball {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  isActive: boolean;
  rotation: number;
}

export interface ExplosionParticle {
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
}

export interface CelebrationParticle {
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
  type: 'confetti' | 'star' | 'sparkle';
  rotation: number;
  rotationSpeed: number;
}

export interface CurvedBoard {
  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  width: number;
  height: number;
  curveRadius: number;
}

export interface Bridge {
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
}

export interface Hole {
  x: number;
  y: number;
  radius: number;
  z: number;
}

export interface Launcher {
  x: number;
  y: number;
  width: number;
  height: number;
  power: number;
  maxPower: number;
  isCharging: boolean;
  chargeProgress: number;
}

export interface PinballState {
  balls: Ball[];
  activeBall: Ball | null;
  curvedBoard: CurvedBoard;
  bridge: Bridge;
  hole: Hole;
  launcher: Launcher;
  explosionParticles: ExplosionParticle[];
  celebrationParticles: CelebrationParticle[];
  score: number;
  isCelebrating: boolean;
  celebrationTimer: number;
  cameraAngle: number;
  cameraHeight: number;
}

export const defaultPinballState: PinballState = {
  balls: [],
  activeBall: null,
  curvedBoard: {
    x: 0,
    y: 0,
    angle: 0,
    targetAngle: 0,
    width: 200,
    height: 30,
    curveRadius: 150,
  },
  bridge: {
    x: 0,
    y: 0,
    width: 300,
    height: 20,
    z: 0,
  },
  hole: {
    x: 0,
    y: 0,
    radius: 40,
    z: 0,
  },
  launcher: {
    x: 0,
    y: 0,
    width: 60,
    height: 120,
    power: 0,
    maxPower: 100,
    isCharging: false,
    chargeProgress: 0,
  },
  explosionParticles: [],
  celebrationParticles: [],
  score: 0,
  isCelebrating: false,
  celebrationTimer: 0,
  cameraAngle: 0.5,
  cameraHeight: 0.3,
};
