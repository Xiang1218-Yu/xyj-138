export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomRange(min, max + 1));
};

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

export const angle = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.atan2(y2 - y1, x2 - x1);
};

export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const radToDeg = (radians: number): number => {
  return radians * (180 / Math.PI);
};

export const normalizeAngle = (angle: number): number => {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

export const lerpAngle = (start: number, end: number, t: number): number => {
  const diff = normalizeAngle(end - start);
  return start + diff * t;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const noise = (x: number, y: number, seed: number = 0): number => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};
