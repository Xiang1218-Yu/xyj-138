export type FireworkType =
  | 'peony'
  | 'chrysanthemum'
  | 'willow'
  | 'ring'
  | 'heart'
  | 'star'
  | 'palm'
  | 'crossette'
  | 'spiral';

export interface GradientColor {
  color1: string;
  color2: string;
}

export interface FireworkRocket {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  gradientColors?: GradientColor;
  colorMode: 'solid' | 'gradient' | 'rainbow';
  type: FireworkType;
  size: number;
  trail: { x: number; y: number; opacity: number }[];
  exploded: boolean;
  launchAngle: number;
  launchPower: number;
  gravity: number;
}

export interface FireworkParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  gravity: number;
  friction: number;
  type: FireworkType;
  trail: { x: number; y: number; opacity: number }[];
  hasTrail: boolean;
  sparkle: boolean;
  angle: number;
  angularVelocity: number;
}

export interface FireworksState {
  rockets: FireworkRocket[];
  particles: FireworkParticle[];
  fireworkType: FireworkType;
  fireworkColor: string;
  colorMode: 'solid' | 'gradient' | 'rainbow';
  gradientColors: GradientColor;
  autoLaunch: boolean;
  autoLaunchInterval: number;
  launchPower: number;
  particleCount: number;
  gravity: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragCurrentX: number;
  dragCurrentY: number;
  showLaunchPreview: boolean;
  backgroundStars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number }[];
}

export const defaultFireworksState: FireworksState = {
  rockets: [],
  particles: [],
  fireworkType: 'peony',
  fireworkColor: '#ff6b6b',
  colorMode: 'rainbow',
  gradientColors: {
    color1: '#ff6b6b',
    color2: '#4facfe',
  },
  autoLaunch: false,
  autoLaunchInterval: 1500,
  launchPower: 80,
  particleCount: 80,
  gravity: 0.15,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragCurrentX: 0,
  dragCurrentY: 0,
  showLaunchPreview: true,
  backgroundStars: [],
};

export const FIREWORK_TYPE_LABELS: Record<FireworkType, { name: string; desc: string; emoji: string }> = {
  peony: { name: '牡丹', desc: '经典圆形爆炸，花瓣四散', emoji: '🌸' },
  chrysanthemum: { name: '菊花', desc: '长拖尾爆炸，如菊花绽放', emoji: '🌼' },
  willow: { name: '垂柳', desc: '向下垂落，金丝柳绦', emoji: '🌿' },
  ring: { name: '光环', desc: '均匀圆环，神圣光环', emoji: '💫' },
  heart: { name: '爱心', desc: '浪漫心形，告白神器', emoji: '❤️' },
  star: { name: '五角星', desc: '立体五角星，闪耀夜空', emoji: '⭐' },
  palm: { name: '椰树', desc: '向上伸展，棕榈树形', emoji: '🌴' },
  crossette: { name: '十字', desc: '多次爆裂，交叉闪烁', emoji: '✨' },
  spiral: { name: '螺旋', desc: '旋转扩散，银河漩涡', emoji: '🌀' },
};

export const FIREWORK_COLOR_PRESETS = [
  '#ff6b6b',
  '#feca57',
  '#48dbfb',
  '#ff9ff3',
  '#54a0ff',
  '#5f27cd',
  '#00d2d3',
  '#1dd1a1',
  '#ff9f43',
  '#ee5a24',
  '#f368e0',
  '#00cec9',
  '#fd79a8',
  '#ffffff',
  '#fff68f',
  '#ff7f50',
];

export const FIREWORK_GRADIENT_PRESETS: { color1: string; color2: string; name: string }[] = [
  { color1: '#ff6b6b', color2: '#feca57', name: '日落' },
  { color1: '#48dbfb', color2: '#ff9ff3', name: '梦幻' },
  { color1: '#54a0ff', color2: '#5f27cd', name: '星空' },
  { color1: '#00d2d3', color2: '#1dd1a1', name: '翡翠' },
  { color1: '#ff9f43', color2: '#ee5a24', name: '火焰' },
  { color1: '#f368e0', color2: '#ff6b6b', name: '樱花' },
  { color1: '#fff68f', color2: '#ff7f50', name: '金辉' },
  { color1: '#00cec9', color2: '#6c5ce7', name: '极光' },
];
