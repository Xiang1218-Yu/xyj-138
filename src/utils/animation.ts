export const easeInQuad = (t: number): number => t * t;
export const easeOutQuad = (t: number): number => t * (2 - t);
export const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export const easeInCubic = (t: number): number => t * t * t;
export const easeOutCubic = (t: number): number => --t * t * t + 1;
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const easeInBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeInOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

export const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

export const spring = (
  current: number,
  target: number,
  velocity: number,
  stiffness: number = 100,
  damping: number = 10,
  mass: number = 1
): { position: number; velocity: number } => {
  const force = -stiffness * (current - target);
  const dampingForce = -damping * velocity;
  const acceleration = (force + dampingForce) / mass;
  const newVelocity = velocity + acceleration * 0.016;
  const newPosition = current + newVelocity * 0.016;
  return { position: newPosition, velocity: newVelocity };
};

export const animateValue = (
  from: number,
  to: number,
  duration: number,
  easing: (t: number) => number = easeOutQuad,
  onUpdate: (value: number) => void,
  onComplete?: () => void
): () => void => {
  const startTime = performance.now();
  let animationId: number;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const value = from + (to - from) * easedProgress;
    onUpdate(value);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };

  animationId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(animationId);
};

export const bezier = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
};

export const bezier2D = (
  t: number,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number
): { x: number; y: number } => {
  return {
    x: bezier(t, x0, x1, x2, x3),
    y: bezier(t, y0, y1, y2, y3),
  };
};
