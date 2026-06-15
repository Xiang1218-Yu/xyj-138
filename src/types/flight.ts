export interface Aircraft {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  altitude: number;
  fuel: number;
  maxFuel: number;
  isThrusting: boolean;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
  puffCount: number;
  layer: number;
}

export interface Mountain {
  x: number;
  height: number;
  width: number;
  color: string;
  parallaxSpeed: number;
}

export interface ThrustParticle {
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

export interface FlightState {
  aircraft: Aircraft;
  clouds: Cloud[];
  mountains: Mountain[];
  thrustParticles: ThrustParticle[];
  isMouseDown: boolean;
  mouseX: number;
  mouseY: number;
}
