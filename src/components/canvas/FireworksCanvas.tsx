import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { FireworkRocket, FireworkParticle, FireworkType, GradientColor } from '@/types/fireworks';
import { generateId, randomRange, distance, lerp } from '@/utils/math';
import { withAlpha, hslToHex } from '@/utils/colors';

const RAINBOW_COLORS = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
  '#0000ff', '#4b0082', '#9400d3', '#ff1493',
];

interface FireworksCanvasProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const { canvasRef, getContext, width, height, clear } = useCanvas();
  const {
    fireworks: {
      fireworkType,
      fireworkColor,
      colorMode,
      gradientColors,
      autoLaunch,
      autoLaunchInterval,
      launchPower,
      particleCount,
      gravity,
      isDragging,
      dragStartX,
      dragStartY,
      dragCurrentX,
      dragCurrentY,
      showLaunchPreview,
      backgroundStars,
    },
    setFireworkIsDragging,
    setFireworkDragStart,
    setFireworkDragCurrent,
    setFireworkBackgroundStars,
    setCursorType,
    addFireworkRocket,
    addFireworkParticle,
    clearAllFireworks,
  } = useAppStore();

  const rocketsRef = useRef<FireworkRocket[]>([]);
  const particlesRef = useRef<FireworkParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const dragRef = useRef({
    startX: 0, startY: 0, currentX: 0, currentY: 0,
    isDragging: false,
  });
  const autoLaunchTimerRef = useRef<number>(0);
  const starsRef = useRef<{ x: number; y: number; size: number; opacity: number; twinkleSpeed: number; phase: number }[]>([]);

  useEffect(() => {
    if (width > 0 && height > 0 && (backgroundStars.length === 0 || starsRef.current.length === 0)) {
      const stars = [];
      for (let i = 0; i < 150; i++) {
        const star = {
          x: Math.random() * width,
          y: Math.random() * height * 0.8,
          size: randomRange(0.5, 2.5),
          opacity: randomRange(0.3, 1),
          twinkleSpeed: randomRange(0.5, 3),
          phase: Math.random() * Math.PI * 2,
        };
        stars.push(star);
      }
      starsRef.current = stars;
      setFireworkBackgroundStars(stars.map(s => ({
        x: s.x, y: s.y, size: s.size, opacity: s.opacity, twinkleSpeed: s.twinkleSpeed
      })));
    }
  }, [width, height, backgroundStars.length, setFireworkBackgroundStars]);

  const getFireworkColor = useCallback((index: number, total: number): string => {
    if (colorMode === 'solid') {
      return fireworkColor;
    } else if (colorMode === 'gradient') {
      const t = index / Math.max(total - 1, 1);
      return interpolateColor(gradientColors, t);
    } else {
      const hue = (index / total) * 360;
      return hslToHex(hue, 100, 60);
    }
  }, [colorMode, fireworkColor, gradientColors]);

  const getRandomFireworkColor = useCallback((): string => {
    if (colorMode === 'solid') {
      return fireworkColor;
    } else if (colorMode === 'gradient') {
      const t = Math.random();
      return interpolateColor(gradientColors, t);
    } else {
      return RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)];
    }
  }, [colorMode, fireworkColor, gradientColors]);

  const interpolateColor = (gc: GradientColor, t: number): string => {
    const c1 = hexToRgbObj(gc.color1);
    const c2 = hexToRgbObj(gc.color2);
    const r = Math.round(lerp(c1.r, c2.r, t));
    const g = Math.round(lerp(c1.g, c2.g, t));
    const b = Math.round(lerp(c1.b, c2.b, t));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToRgbObj = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 255, g: 255, b: 255 };
  };

  const launchRocket = useCallback((startX: number, startY: number, targetX: number, targetY: number) => {
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = distance(startX, startY, targetX, targetY);
    const power = Math.min(dist / 10, launchPower / 5);
    const angle = Math.atan2(dy, dx);
    const speed = Math.max(8, Math.min(power, 20));

    const rocket: FireworkRocket = {
      id: generateId(),
      x: startX,
      y: startY,
      targetX,
      targetY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: getRandomFireworkColor(),
      gradientColors: colorMode === 'gradient' ? gradientColors : undefined,
      colorMode,
      type: fireworkType,
      size: 4,
      trail: [],
      exploded: false,
      launchAngle: angle,
      launchPower: power,
      gravity,
    };

    rocketsRef.current = [...rocketsRef.current, rocket];
  }, [colorMode, fireworkType, gradientColors, getRandomFireworkColor, launchPower, gravity]);

  const explodeFirework = useCallback((rocket: FireworkRocket) => {
    const count = particleCount;
    const type = rocket.type;
    const newParticles: FireworkParticle[] = [];

    const baseColor = rocket.color;
    const hsl = rgbToHslObj(baseColor);

    switch (type) {
      case 'peony':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const speed = randomRange(3, 8);
          const color = getFireworkColor(i, count);
          newParticles.push(createFireworkParticle(
            rocket.x, rocket.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color, true, true, 1.0
          ));
        }
        break;

      case 'chrysanthemum':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + randomRange(-0.05, 0.05);
          const speed = randomRange(5, 9);
          const color = getFireworkColor(i, count);
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color, true, true, 1.5
          );
          p.friction = 0.98;
          p.maxLife = 120;
          p.life = 120;
          newParticles.push(p);
        }
        break;

      case 'willow':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const speed = randomRange(2, 5);
          const color = getFireworkColor(i, count);
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 2,
            color, true, false, 2.0
          );
          p.gravity = 0.3;
          p.friction = 0.99;
          p.maxLife = 150;
          p.life = 150;
          newParticles.push(p);
        }
        break;

      case 'ring':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const speed = 6;
          const color = getFireworkColor(i, count);
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color, false, true, 1.2
          );
          p.friction = 0.985;
          newParticles.push(p);
        }
        break;

      case 'heart':
        for (let i = 0; i < count; i++) {
          const t = (i / count) * Math.PI * 2;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const scale = 0.4;
          const speed = 6;
          const color = '#ff6b9d';
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            heartX * scale * speed / 16,
            heartY * scale * speed / 16,
            color, true, true, 1.2
          );
          newParticles.push(p);
        }
        for (let i = 0; i < count / 2; i++) {
          const t = (i / (count / 2)) * Math.PI * 2;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const scale = 0.3;
          const color = '#ffa8c5';
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            heartX * scale * 5 / 16,
            heartY * scale * 5 / 16,
            color, false, true, 0.8
          );
          p.maxLife = 80;
          p.life = 80;
          newParticles.push(p);
        }
        break;

      case 'star':
        const starPoints = 5;
        const innerRadius = 3;
        const outerRadius = 7;
        for (let i = 0; i < count; i++) {
          const totalPoints = starPoints * 2;
          const pointIndex = i % totalPoints;
          const baseAngle = (pointIndex / totalPoints) * Math.PI * 2 - Math.PI / 2;
          const r = (pointIndex % 2 === 0) ? outerRadius : innerRadius;
          const angleVariation = (Math.floor(i / totalPoints)) * (Math.PI * 2 / (count / totalPoints));
          const finalAngle = baseAngle + angleVariation * 0.1;
          const color = getFireworkColor(i, count);
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            Math.cos(finalAngle) * r,
            Math.sin(finalAngle) * r,
            color, true, true, 1.2
          );
          newParticles.push(p);
        }
        break;

      case 'palm':
        const palmFronds = 7;
        for (let f = 0; f < palmFronds; f++) {
          const frondAngle = -Math.PI / 2 + (f - (palmFronds - 1) / 2) * 0.35;
          for (let i = 0; i < count / palmFronds; i++) {
            const speed = randomRange(4, 9);
            const spread = randomRange(-0.1, 0.1);
            const color = getFireworkColor(f * (count / palmFronds) + i, count);
            const p = createFireworkParticle(
              rocket.x, rocket.y,
              Math.cos(frondAngle + spread) * speed,
              Math.sin(frondAngle + spread) * speed,
              color, true, true, 1.5
            );
            p.maxLife = 130;
            p.life = 130;
            p.gravity = 0.12;
            newParticles.push(p);
          }
        }
        break;

      case 'crossette':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const speed = randomRange(4, 7);
          const color = getFireworkColor(i, count);
          const p = createFireworkParticle(
            rocket.x, rocket.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color, false, true, 1.3
          );
          p.maxLife = 50;
          p.life = 50;
          newParticles.push(p);
        }
        break;

      case 'spiral':
        const arms = 3;
        for (let a = 0; a < arms; a++) {
          for (let i = 0; i < count / arms; i++) {
            const t = i / (count / arms);
            const spiralAngle = (a / arms) * Math.PI * 2 + t * Math.PI * 4;
            const speed = 2 + t * 6;
            const color = getFireworkColor(a * (count / arms) + i, count);
            const p = createFireworkParticle(
              rocket.x, rocket.y,
              Math.cos(spiralAngle) * speed,
              Math.sin(spiralAngle) * speed,
              color, true, true, 1.0
            );
            p.angularVelocity = randomRange(-0.05, 0.05);
            p.angle = spiralAngle;
            newParticles.push(p);
          }
        }
        break;
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, [particleCount, getFireworkColor]);

  const createFireworkParticle = (
    x: number, y: number,
    vx: number, vy: number,
    color: string,
    hasTrail: boolean,
    sparkle: boolean,
    gravityMultiplier: number = 1
  ): FireworkParticle => {
    return {
      id: generateId(),
      x,
      y,
      vx,
      vy,
      color,
      size: randomRange(2, 4),
      opacity: 1,
      life: 100,
      maxLife: 100,
      gravity: gravity * gravityMultiplier,
      friction: 0.97,
      type: fireworkType,
      trail: [],
      hasTrail,
      sparkle,
      angle: 0,
      angularVelocity: 0,
    };
  };

  const rgbToHslObj = (rgbStr: string): { h: number; s: number; l: number } => {
    const match = rgbStr.match(/\d+/g);
    let r: number, g: number, b: number;
    if (match && match.length === 3) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    } else {
      const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgbStr);
      if (hex) {
        r = parseInt(hex[1], 16);
        g = parseInt(hex[2], 16);
        b = parseInt(hex[3], 16);
      } else {
        return { h: 0, s: 100, l: 60 };
      }
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const render = useCallback((deltaTime: number, time: number) => {
    const ctx = getContext();
    if (!ctx || width === 0 || height === 0) return;

    ctx.fillStyle = 'rgba(5, 5, 20, 0.18)';
    ctx.fillRect(0, 0, width, height);

    drawStars(ctx, time);
    drawGround(ctx);

    if (autoLaunch) {
      autoLaunchTimerRef.current += deltaTime * 1000;
      if (autoLaunchTimerRef.current >= autoLaunchInterval) {
        autoLaunchTimerRef.current = 0;
        const startX = randomRange(width * 0.1, width * 0.9);
        const startY = height - 20;
        const targetX = randomRange(width * 0.15, width * 0.85);
        const targetY = randomRange(height * 0.1, height * 0.45);
        launchRocket(startX, startY, targetX, targetY);
      }
    }

    const rocketsToRemove: string[] = [];
    for (const rocket of rocketsRef.current) {
      if (rocket.exploded) {
        rocketsToRemove.push(rocket.id);
        continue;
      }

      rocket.trail.unshift({ x: rocket.x, y: rocket.y, opacity: 1 });
      if (rocket.trail.length > 15) rocket.trail.pop();
      rocket.trail.forEach((t, i) => {
        t.opacity = 1 - (i / rocket.trail.length);
      });

      rocket.x += rocket.vx;
      rocket.y += rocket.vy;
      rocket.vy += rocket.gravity * 0.5;

      const dist = distance(rocket.x, rocket.y, rocket.targetX, rocket.targetY);
      const reachedTarget = dist < 15 || rocket.vy >= 0;

      if (reachedTarget || rocket.y < height * 0.05) {
        rocket.exploded = true;
        explodeFirework(rocket);
        rocketsToRemove.push(rocket.id);
        continue;
      }

      drawRocket(ctx, rocket);
    }

    if (rocketsToRemove.length > 0) {
      rocketsRef.current = rocketsRef.current.filter(r => !rocketsToRemove.includes(r.id));
    }

    const particlesToRemove: string[] = [];
    for (const p of particlesRef.current) {
      if (p.life <= 0) {
        particlesToRemove.push(p.id);
        continue;
      }

      if (p.hasTrail) {
        p.trail.unshift({ x: p.x, y: p.y, opacity: 1 });
        if (p.trail.length > 8) p.trail.pop();
        p.trail.forEach((t, i) => {
          t.opacity = 1 - (i / p.trail.length);
        });
      }

      if (p.angularVelocity !== 0) {
        p.angle += p.angularVelocity;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        p.vx = Math.cos(p.angle) * currentSpeed;
        p.vy = Math.sin(p.angle) * currentSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.life -= 1;
      p.opacity = Math.max(0, p.life / p.maxLife);

      drawParticle(ctx, p, time);
    }

    if (particlesToRemove.length > 0) {
      particlesRef.current = particlesRef.current.filter(p => !particlesToRemove.includes(p.id));
    }

    if (isDragging && showLaunchPreview) {
      drawLaunchPreview(ctx);
    }

    if (!isDragging && mouseRef.current.x > 0 && mouseRef.current.y > 0) {
      drawAimCursor(ctx);
    }
  }, [
    width, height, autoLaunch, autoLaunchInterval,
    isDragging, showLaunchPreview,
    launchRocket, explodeFirework, getContext
  ]);

  const drawStars = (ctx: CanvasRenderingContext2D, time: number) => {
    for (const star of starsRef.current) {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.phase);
      const opacity = star.opacity * (0.4 + 0.6 * twinkle);

      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 3
      );
      gradient.addColorStop(0, withAlpha('#ffffff', opacity));
      gradient.addColorStop(0.3, withAlpha('#ffffff', opacity * 0.5));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = withAlpha('#ffffff', opacity);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, height - 60, 0, height);
    gradient.addColorStop(0, 'rgba(20, 10, 40, 0.3)');
    gradient.addColorStop(1, 'rgba(10, 5, 25, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - 60, width, 60);

    const cityLights = 40;
    for (let i = 0; i < cityLights; i++) {
      const x = (i / cityLights) * width + Math.sin(i * 7.3) * 20;
      const y = height - 30 - Math.abs(Math.sin(i * 3.7)) * 25;
      const size = 1 + Math.abs(Math.sin(i * 2.3)) * 1.5;
      const hue = (i * 37) % 360;
      ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${0.3 + Math.abs(Math.sin(i * 1.7)) * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawRocket = (ctx: CanvasRenderingContext2D, rocket: FireworkRocket) => {
    for (let i = 0; i < rocket.trail.length; i++) {
      const t = rocket.trail[i];
      const size = rocket.size * (1 - i * 0.06);
      ctx.fillStyle = withAlpha(rocket.color, t.opacity * 0.6);
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const glow = ctx.createRadialGradient(
      rocket.x, rocket.y, 0,
      rocket.x, rocket.y, rocket.size * 4
    );
    glow.addColorStop(0, withAlpha(rocket.color, 0.9));
    glow.addColorStop(0.3, withAlpha(rocket.color, 0.5));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(rocket.x, rocket.y, rocket.size * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rocket.x, rocket.y, rocket.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, p: FireworkParticle, time: number) => {
    if (p.hasTrail) {
      for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        const size = p.size * (1 - i * 0.12);
        ctx.fillStyle = withAlpha(p.color, t.opacity * p.opacity * 0.5);
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (p.sparkle && p.life < p.maxLife * 0.6) {
      const sparkleIntensity = Math.sin(time * 0.03 + p.x * 0.1) * 0.5 + 0.5;
      if (sparkleIntensity > 0.7) {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        glow.addColorStop(0, withAlpha('#ffffff', p.opacity * 0.8));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const glow = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, p.size * 3
    );
    glow.addColorStop(0, withAlpha(p.color, p.opacity));
    glow.addColorStop(0.4, withAlpha(p.color, p.opacity * 0.5));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = withAlpha(p.color, p.opacity);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.opacity > 0.6) {
      ctx.fillStyle = withAlpha('#ffffff', p.opacity * 0.9);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawLaunchPreview = (ctx: CanvasRenderingContext2D) => {
    const start = { x: dragRef.current.startX, y: dragRef.current.startY };
    const current = { x: dragRef.current.currentX, y: dragRef.current.currentY };

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const dx = start.x - current.x;
    const dy = start.y - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(dist / 100, 1);

    const gradient = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, 20);
    gradient.addColorStop(0, withAlpha('#ff6b6b', 0.8));
    gradient.addColorStop(0.5, withAlpha('#feca57', 0.5));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(start.x, start.y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
    ctx.fill();

    const targetX = current.x;
    const targetY = current.y;
    const targetGradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30);
    targetGradient.addColorStop(0, withAlpha('#48dbfb', 0.6));
    targetGradient.addColorStop(0.5, withAlpha('#54a0ff', 0.3));
    targetGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = targetGradient;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = withAlpha('#48dbfb', 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = withAlpha('#48dbfb', 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(targetX - 25, targetY);
    ctx.lineTo(targetX + 25, targetY);
    ctx.moveTo(targetX, targetY - 25);
    ctx.lineTo(targetX, targetY + 25);
    ctx.stroke();

    const powerBarWidth = 100;
    const powerBarHeight = 6;
    const powerBarX = start.x - powerBarWidth / 2;
    const powerBarY = start.y + 35;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(powerBarX, powerBarY, powerBarWidth, powerBarHeight, 3);
    ctx.fill();

    const powerGradient = ctx.createLinearGradient(powerBarX, 0, powerBarX + powerBarWidth, 0);
    powerGradient.addColorStop(0, '#1dd1a1');
    powerGradient.addColorStop(0.5, '#feca57');
    powerGradient.addColorStop(1, '#ff6b6b');
    ctx.fillStyle = powerGradient;
    ctx.beginPath();
    ctx.roundRect(powerBarX, powerBarY, powerBarWidth * power, powerBarHeight, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`力度: ${Math.round(power * 100)}%`, start.x, powerBarY + powerBarHeight + 18);
  };

  const drawAimCursor = (ctx: CanvasRenderingContext2D) => {
    const x = mouseRef.current.x;
    const y = mouseRef.current.y;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x - 16, y);
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x + 20, y);
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y - 16);
    ctx.moveTo(x, y + 16);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
  };

  useAnimationFrame(render, true);

  const getRelativePosition = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getRelativePosition(e.clientX, e.clientY);
    if (pos) {
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;

      if (dragRef.current.isDragging) {
        dragRef.current.currentX = pos.x;
        dragRef.current.currentY = pos.y;
        setFireworkDragCurrent(pos.x, pos.y);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getRelativePosition(e.clientX, e.clientY);
    if (pos) {
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;
      mouseRef.current.isDown = true;
      setCursorType('draw');

      dragRef.current = {
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
        isDragging: true,
      };
      setFireworkIsDragging(true);
      setFireworkDragStart(pos.x, pos.y);
      setFireworkDragCurrent(pos.x, pos.y);
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current.isDragging) {
      const startX = dragRef.current.startX;
      const startY = height - 20;
      const targetX = dragRef.current.currentX;
      const targetY = dragRef.current.currentY;
      launchRocket(startX, startY, targetX, targetY);
    }
    mouseRef.current.isDown = false;
    dragRef.current.isDragging = false;
    setFireworkIsDragging(false);
    setCursorType('hover');
  };

  const handleMouseEnter = () => {
    onMouseEnter?.();
    setCursorType('hover');
  };

  const handleMouseLeave = () => {
    onMouseLeave?.();
    handleMouseUp();
    setCursorType('default');
    mouseRef.current.x = -999;
    mouseRef.current.y = -999;
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const pos = getRelativePosition(touch.clientX, touch.clientY);
          if (pos) {
            mouseRef.current.x = pos.x;
            mouseRef.current.y = pos.y;
            dragRef.current = {
              startX: pos.x,
              startY: pos.y,
              currentX: pos.x,
              currentY: pos.y,
              isDragging: true,
            };
            setFireworkIsDragging(true);
            setFireworkDragStart(pos.x, pos.y);
            setFireworkDragCurrent(pos.x, pos.y);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const pos = getRelativePosition(touch.clientX, touch.clientY);
          if (pos) {
            mouseRef.current.x = pos.x;
            mouseRef.current.y = pos.y;
            if (dragRef.current.isDragging) {
              dragRef.current.currentX = pos.x;
              dragRef.current.currentY = pos.y;
              setFireworkDragCurrent(pos.x, pos.y);
            }
          }
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (dragRef.current.isDragging) {
            const startX = dragRef.current.startX;
            const startY = height - 20;
            const targetX = dragRef.current.currentX;
            const targetY = dragRef.current.currentY;
            launchRocket(startX, startY, targetX, targetY);
          }
          dragRef.current.isDragging = false;
          setFireworkIsDragging(false);
        }}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none text-center">
        <div>
          {dragRef.current.isDragging
            ? '松开鼠标发射烟花！🎆'
            : '按住鼠标拖动瞄准，松开发射烟花'}
        </div>
        <div className="text-xs mt-1">调整拖动方向和距离控制角度与力度</div>
      </div>
    </div>
  );
};
