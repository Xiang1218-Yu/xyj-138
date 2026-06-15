import { create } from 'zustand';
import { Flower, Particle, StarParticle, Stem } from '../types/flower';
import { Aircraft, Cloud, Mountain, ThrustParticle } from '../types/flight';
import { FluidParticle, FluidState, defaultFluidState } from '../types/fluid';
import {
  KaleidoscopeState,
  defaultKaleidoscopeState,
  KaleidoscopeStroke,
  Point,
  SymmetryMode,
  ColorMode,
  GradientColor,
} from '../types/kaleidoscope';
import {
  FireworksState,
  defaultFireworksState,
  FireworkRocket,
  FireworkParticle,
  FireworkType,
} from '../types/fireworks';

interface AppState {
  isTransitioning: boolean;
  mouseX: number;
  mouseY: number;
  cursorType: 'default' | 'hover' | 'draw';

  garden: {
    flowers: Flower[];
    particles: Particle[];
    stars: StarParticle[];
    stems: Stem[];
    currentStem: Stem | null;
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

  fluid: FluidState;

  kaleidoscope: KaleidoscopeState;
  fireworks: FireworksState;

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
  setCurrentStem: (stem: Stem | null) => void;
  updateCurrentStem: (updates: Partial<Stem>) => void;
  addStem: (stem: Stem) => void;
  updateStem: (id: string, updates: Partial<Stem>) => void;
  clearStems: () => void;

  updateAircraft: (updates: Partial<Aircraft>) => void;
  setIsMouseDown: (value: boolean) => void;
  addThrustParticle: (particle: ThrustParticle) => void;
  resetFlight: () => void;

  addFluidParticle: (particle: FluidParticle) => void;
  updateFluidParticle: (id: string, updates: Partial<FluidParticle>) => void;
  removeFluidParticle: (id: string) => void;
  clearFluidParticles: () => void;
  setFluidSelectedColor: (color: string) => void;
  setFluidViscosity: (value: number) => void;
  setFluidFlowRate: (value: number) => void;
  setFluidBrushSize: (value: number) => void;
  setFluidBlowStrength: (value: number) => void;
  setFluidTool: (tool: 'pour' | 'blow' | 'mix') => void;
  setFluidIsPouring: (value: boolean) => void;
  setFluidIsBlowing: (value: boolean) => void;
  setFluidBackgroundColor: (color: string) => void;
  resetFluid: () => void;

  addKaleidoscopeStroke: (stroke: KaleidoscopeStroke) => void;
  setKaleidoscopeCurrentStroke: (stroke: KaleidoscopeStroke | null) => void;
  updateKaleidoscopeCurrentStroke: (updates: Partial<KaleidoscopeStroke>) => void;
  addPointToCurrentStroke: (point: Point) => void;
  clearKaleidoscopeStrokes: () => void;
  undoKaleidoscopeStroke: () => void;
  setKaleidoscopeSymmetryAxes: (count: number) => void;
  setKaleidoscopeSymmetryMode: (mode: SymmetryMode) => void;
  setKaleidoscopeBrushSize: (size: number) => void;
  setKaleidoscopeStrokeColor: (color: string) => void;
  setKaleidoscopeStrokeColorMode: (mode: ColorMode) => void;
  setKaleidoscopeStrokeGradientColors: (colors: GradientColor) => void;
  setKaleidoscopeBackgroundColor: (color: string) => void;
  setKaleidoscopeBackgroundColorMode: (mode: ColorMode) => void;
  setKaleidoscopeBackgroundGradientColors: (colors: GradientColor) => void;
  setKaleidoscopeShowGuides: (show: boolean) => void;
  setKaleidoscopeIsDrawing: (value: boolean) => void;
  setKaleidoscopeRotation: (rotation: number) => void;
  setKaleidoscopeAnimateRotation: (animate: boolean) => void;
  setKaleidoscopeRotationSpeed: (speed: number) => void;
  resetKaleidoscope: () => void;

  addFireworkRocket: (rocket: FireworkRocket) => void;
  removeFireworkRocket: (id: string) => void;
  clearFireworkRockets: () => void;
  updateFireworkRocket: (id: string, updates: Partial<FireworkRocket>) => void;
  addFireworkParticle: (particle: FireworkParticle) => void;
  removeFireworkParticle: (id: string) => void;
  clearFireworkParticles: () => void;
  updateFireworkParticle: (id: string, updates: Partial<FireworkParticle>) => void;
  setFireworkType: (type: FireworkType) => void;
  setFireworkColor: (color: string) => void;
  setFireworkColorMode: (mode: 'solid' | 'gradient' | 'rainbow') => void;
  setFireworkGradientColors: (colors: GradientColor) => void;
  setFireworkAutoLaunch: (value: boolean) => void;
  setFireworkAutoLaunchInterval: (interval: number) => void;
  setFireworkLaunchPower: (power: number) => void;
  setFireworkParticleCount: (count: number) => void;
  setFireworkGravity: (gravity: number) => void;
  setFireworkIsDragging: (value: boolean) => void;
  setFireworkDragStart: (x: number, y: number) => void;
  setFireworkDragCurrent: (x: number, y: number) => void;
  setFireworkShowLaunchPreview: (value: boolean) => void;
  setFireworkBackgroundStars: (stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[]) => void;
  clearAllFireworks: () => void;
  resetFireworks: () => void;
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
    stems: [],
    currentStem: null,
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

  fluid: { ...defaultFluidState },

  kaleidoscope: { ...defaultKaleidoscopeState },
  fireworks: { ...defaultFireworksState },

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
        stems: [],
        currentStem: null,
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

  setCurrentStem: (stem) =>
    set((state) => ({
      garden: { ...state.garden, currentStem: stem },
    })),

  updateCurrentStem: (updates) =>
    set((state) => ({
      garden: {
        ...state.garden,
        currentStem: state.garden.currentStem
          ? { ...state.garden.currentStem, ...updates }
          : null,
      },
    })),

  addStem: (stem) =>
    set((state) => ({
      garden: {
        ...state.garden,
        stems: [...state.garden.stems, stem],
      },
    })),

  updateStem: (id, updates) =>
    set((state) => ({
      garden: {
        ...state.garden,
        stems: state.garden.stems.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    })),

  clearStems: () =>
    set((state) => ({
      garden: {
        ...state.garden,
        stems: [],
        currentStem: null,
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

  addFluidParticle: (particle) =>
    set((state) => ({
      fluid: {
        ...state.fluid,
        particles: [...state.fluid.particles, particle].slice(-500),
      },
    })),

  updateFluidParticle: (id, updates) =>
    set((state) => ({
      fluid: {
        ...state.fluid,
        particles: state.fluid.particles.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      },
    })),

  removeFluidParticle: (id) =>
    set((state) => ({
      fluid: {
        ...state.fluid,
        particles: state.fluid.particles.filter((p) => p.id !== id),
      },
    })),

  clearFluidParticles: () =>
    set((state) => ({
      fluid: {
        ...state.fluid,
        particles: [],
      },
    })),

  setFluidSelectedColor: (color) =>
    set((state) => ({
      fluid: { ...state.fluid, selectedColor: color },
    })),

  setFluidViscosity: (value) =>
    set((state) => ({
      fluid: { ...state.fluid, viscosity: value },
    })),

  setFluidFlowRate: (value) =>
    set((state) => ({
      fluid: { ...state.fluid, flowRate: value },
    })),

  setFluidBrushSize: (value) =>
    set((state) => ({
      fluid: { ...state.fluid, brushSize: value },
    })),

  setFluidBlowStrength: (value) =>
    set((state) => ({
      fluid: { ...state.fluid, blowStrength: value },
    })),

  setFluidTool: (tool) =>
    set((state) => ({
      fluid: { ...state.fluid, tool },
    })),

  setFluidIsPouring: (value) =>
    set((state) => ({
      fluid: { ...state.fluid, isPouring: value },
    })),

  setFluidIsBlowing: (value) =>
    set((state) => ({
      fluid: { ...state.fluid, isBlowing: value },
    })),

  setFluidBackgroundColor: (color) =>
    set((state) => ({
      fluid: { ...state.fluid, backgroundColor: color },
    })),

  resetFluid: () =>
    set(() => ({
      fluid: { ...defaultFluidState },
    })),

  addKaleidoscopeStroke: (stroke) =>
    set((state) => ({
      kaleidoscope: {
        ...state.kaleidoscope,
        strokes: [...state.kaleidoscope.strokes, stroke],
        currentStroke: null,
      },
    })),

  setKaleidoscopeCurrentStroke: (stroke) =>
    set((state) => ({
      kaleidoscope: {
        ...state.kaleidoscope,
        currentStroke: stroke,
      },
    })),

  updateKaleidoscopeCurrentStroke: (updates) =>
    set((state) => ({
      kaleidoscope: {
        ...state.kaleidoscope,
        currentStroke: state.kaleidoscope.currentStroke
          ? { ...state.kaleidoscope.currentStroke, ...updates }
          : null,
      },
    })),

  addPointToCurrentStroke: (point) =>
    set((state) => ({
      kaleidoscope: {
        ...state.kaleidoscope,
        currentStroke: state.kaleidoscope.currentStroke
          ? {
              ...state.kaleidoscope.currentStroke,
              points: [...state.kaleidoscope.currentStroke.points, point],
            }
          : null,
      },
    })),

  clearKaleidoscopeStrokes: () =>
    set((state) => ({
      kaleidoscope: {
        ...state.kaleidoscope,
        strokes: [],
        currentStroke: null,
      },
    })),

  undoKaleidoscopeStroke: () =>
    set((state) => ({
      kaleidoscope: {
        ...state.kaleidoscope,
        strokes: state.kaleidoscope.strokes.slice(0, -1),
      },
    })),

  setKaleidoscopeSymmetryAxes: (count) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, symmetryAxes: count },
    })),

  setKaleidoscopeSymmetryMode: (mode) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, symmetryMode: mode },
    })),

  setKaleidoscopeBrushSize: (size) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, brushSize: size },
    })),

  setKaleidoscopeStrokeColor: (color) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, strokeColor: color },
    })),

  setKaleidoscopeStrokeColorMode: (mode) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, strokeColorMode: mode },
    })),

  setKaleidoscopeStrokeGradientColors: (colors) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, strokeGradientColors: colors },
    })),

  setKaleidoscopeBackgroundColor: (color) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, backgroundColor: color },
    })),

  setKaleidoscopeBackgroundColorMode: (mode) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, backgroundColorMode: mode },
    })),

  setKaleidoscopeBackgroundGradientColors: (colors) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, backgroundGradientColors: colors },
    })),

  setKaleidoscopeShowGuides: (show) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, showGuides: show },
    })),

  setKaleidoscopeIsDrawing: (value) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, isDrawing: value },
    })),

  setKaleidoscopeRotation: (rotation) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, rotation },
    })),

  setKaleidoscopeAnimateRotation: (animate) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, animateRotation: animate },
    })),

  setKaleidoscopeRotationSpeed: (speed) =>
    set((state) => ({
      kaleidoscope: { ...state.kaleidoscope, rotationSpeed: speed },
    })),

  resetKaleidoscope: () =>
    set(() => ({
      kaleidoscope: { ...defaultKaleidoscopeState },
    })),

  addFireworkRocket: (rocket) =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        rockets: [...state.fireworks.rockets, rocket],
      },
    })),

  removeFireworkRocket: (id) =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        rockets: state.fireworks.rockets.filter((r) => r.id !== id),
      },
    })),

  clearFireworkRockets: () =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        rockets: [],
      },
    })),

  updateFireworkRocket: (id, updates) =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        rockets: state.fireworks.rockets.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      },
    })),

  addFireworkParticle: (particle) =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        particles: [...state.fireworks.particles, particle].slice(-2000),
      },
    })),

  removeFireworkParticle: (id) =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        particles: state.fireworks.particles.filter((p) => p.id !== id),
      },
    })),

  clearFireworkParticles: () =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        particles: [],
      },
    })),

  updateFireworkParticle: (id, updates) =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        particles: state.fireworks.particles.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      },
    })),

  setFireworkType: (type) =>
    set((state) => ({
      fireworks: { ...state.fireworks, fireworkType: type },
    })),

  setFireworkColor: (color) =>
    set((state) => ({
      fireworks: { ...state.fireworks, fireworkColor: color },
    })),

  setFireworkColorMode: (mode) =>
    set((state) => ({
      fireworks: { ...state.fireworks, colorMode: mode },
    })),

  setFireworkGradientColors: (colors) =>
    set((state) => ({
      fireworks: { ...state.fireworks, gradientColors: colors },
    })),

  setFireworkAutoLaunch: (value) =>
    set((state) => ({
      fireworks: { ...state.fireworks, autoLaunch: value },
    })),

  setFireworkAutoLaunchInterval: (interval) =>
    set((state) => ({
      fireworks: { ...state.fireworks, autoLaunchInterval: interval },
    })),

  setFireworkLaunchPower: (power) =>
    set((state) => ({
      fireworks: { ...state.fireworks, launchPower: power },
    })),

  setFireworkParticleCount: (count) =>
    set((state) => ({
      fireworks: { ...state.fireworks, particleCount: count },
    })),

  setFireworkGravity: (gravity) =>
    set((state) => ({
      fireworks: { ...state.fireworks, gravity },
    })),

  setFireworkIsDragging: (value) =>
    set((state) => ({
      fireworks: { ...state.fireworks, isDragging: value },
    })),

  setFireworkDragStart: (x, y) =>
    set((state) => ({
      fireworks: { ...state.fireworks, dragStartX: x, dragStartY: y },
    })),

  setFireworkDragCurrent: (x, y) =>
    set((state) => ({
      fireworks: { ...state.fireworks, dragCurrentX: x, dragCurrentY: y },
    })),

  setFireworkShowLaunchPreview: (value) =>
    set((state) => ({
      fireworks: { ...state.fireworks, showLaunchPreview: value },
    })),

  setFireworkBackgroundStars: (stars) =>
    set((state) => ({
      fireworks: { ...state.fireworks, backgroundStars: stars },
    })),

  clearAllFireworks: () =>
    set((state) => ({
      fireworks: {
        ...state.fireworks,
        rockets: [],
        particles: [],
      },
    })),

  resetFireworks: () =>
    set(() => ({
      fireworks: { ...defaultFireworksState },
    })),
}));
