import { create } from 'zustand';
import { Flower, Particle, StarParticle } from '../types/flower';
import { Aircraft, Cloud, Mountain, ThrustParticle } from '../types/flight';

interface AppState {
  isTransitioning: boolean;
  mouseX: number;
  mouseY: number;
  cursorType: 'default' | 'hover' | 'draw';

  garden: {
    flowers: Flower[];
    particles: Particle[];
    stars: StarParticle[];
    selectedColor: string;
    flowerSize: number;
    isDrawing: boolean;
    lastFlowerTime: number;
  };

  flight: {
    aircraft: Aircraft;
    clouds: Cloud[];
    mountains: Mountain[];
    thrustParticles: ThrustParticle[];
    isMouseDown: boolean;
  };

  setTransitioning: (value: boolean) => void;
  setMousePosition: (x: number, y: number) => void;
  setCursorType: (type: 'default' | 'hover' | 'draw') => void;

  addFlower: (flower: Flower) => void;
  removeFlower: (id: string) => void;
  clearFlowers: () => void;
  addParticle: (particle: Particle) => void;
  setSelectedColor: (color: string) => void;
  setFlowerSize: (size: number) => void;
  setIsDrawing: (value: boolean) => void;
  updateFlower: (id: string, updates: Partial<Flower>) => void;

  updateAircraft: (updates: Partial<Aircraft>) => void;
  setIsMouseDown: (value: boolean) => void;
  addThrustParticle: (particle: ThrustParticle) => void;
  resetFlight: () => void;
}

const initialAircraft: Aircraft = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  velocityX: 0,
  velocityY: 0,
  angle: 0,
  speed: 0,
  maxSpeed: 8,
  altitude: 0,
  fuel: 100,
  maxFuel: 100,
  isThrusting: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  isTransitioning: false,
  mouseX: 0,
  mouseY: 0,
  cursorType: 'default',

  garden: {
    flowers: [],
    particles: [],
    stars: [],
    selectedColor: '#667eea',
    flowerSize: 60,
    isDrawing: false,
    lastFlowerTime: 0,
  },

  flight: {
    aircraft: initialAircraft,
    clouds: [],
    mountains: [],
    thrustParticles: [],
    isMouseDown: false,
  },

  setTransitioning: (value) => set({ isTransitioning: value }),
  setMousePosition: (x, y) => set({ mouseX: x, mouseY: y }),
  setCursorType: (type) => set({ cursorType: type }),

  addFlower: (flower) =>
    set((state) => ({
      garden: {
        ...state.garden,
        flowers: [...state.garden.flowers, flower],
        lastFlowerTime: Date.now(),
      },
    })),

  removeFlower: (id) =>
    set((state) => ({
      garden: {
        ...state.garden,
        flowers: state.garden.flowers.filter((f) => f.id !== id),
      },
    })),

  clearFlowers: () =>
    set((state) => ({
      garden: {
        ...state.garden,
        flowers: [],
        particles: [],
      },
    })),

  addParticle: (particle) =>
    set((state) => ({
      garden: {
        ...state.garden,
        particles: [...state.garden.particles, particle].slice(-200),
      },
    })),

  setSelectedColor: (color) =>
    set((state) => ({
      garden: { ...state.garden, selectedColor: color },
    })),

  setFlowerSize: (size) =>
    set((state) => ({
      garden: { ...state.garden, flowerSize: size },
    })),

  setIsDrawing: (value) =>
    set((state) => ({
      garden: { ...state.garden, isDrawing: value },
    })),

  updateFlower: (id, updates) =>
    set((state) => ({
      garden: {
        ...state.garden,
        flowers: state.garden.flowers.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      },
    })),

  updateAircraft: (updates) =>
    set((state) => ({
      flight: {
        ...state.flight,
        aircraft: { ...state.flight.aircraft, ...updates },
      },
    })),

  setIsMouseDown: (value) =>
    set((state) => ({
      flight: { ...state.flight, isMouseDown: value },
    })),

  addThrustParticle: (particle) =>
    set((state) => ({
      flight: {
        ...state.flight,
        thrustParticles: [...state.flight.thrustParticles, particle].slice(-150),
      },
    })),

  resetFlight: () =>
    set((state) => ({
      flight: {
        ...state.flight,
        aircraft: { ...initialAircraft },
        thrustParticles: [],
      },
    })),
}));
