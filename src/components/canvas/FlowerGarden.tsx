import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { Flower, Petal, Particle, StarParticle, Stem, StemPoint, Leaf } from '@/types/flower';
import {
  generateId,
  randomRange,
  randomInt,
  lerp,
  distance,
  angle,
} from '@/utils/math';
import {
  easeOutBack,
  easeOutQuad,
  easeInOutQuad,
} from '@/utils/animation';
import {
  createGradient,
  withAlpha,
  lightenColor,
  darkenColor,
} from '@/utils/colors';

interface FlowerGardenProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FlowerGarden: React.FC<FlowerGardenProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const { canvasRef, getContext, width, height, clear } = useCanvas();
  const {
    garden: {
      flowers,
      particles,
      stems,
      currentStem,
      selectedColor,
      flowerSize,
      isDrawing,
    },
    addFlower,
    addParticle,
    setIsDrawing,
    updateFlower,
    clearFlowers,
    setCursorType,
    setCurrentStem,
    updateCurrentStem,
    addStem,
  } = useAppStore();

  const mouseRef = useRef({ x: 0, y: 0, isDown: false, startX: 0, startY: 0 });
  const starsRef = useRef<StarParticle[]>([]);
  const timeRef = useRef(0);
  const stemPointsRef = useRef<StemPoint[]>([]);
  const stemLeavesRef = useRef<Leaf[]>([]);
  const lastAddPointTimeRef = useRef(0);
  const stemGrowProgressRef = useRef(0);
  const pendingFlowerRef = useRef<{ x: number; y: number; size: number; color: string; delay: number } | null>(null);

  useEffect(() => {
    const stars: StarParticle[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: randomRange(0.5, 2.5),
        opacity: randomRange(0.2, 0.8),
        twinkleSpeed: randomRange(0.5, 2),
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  const createPetal = (
    cx: number,
    cy: number,
    angle: number,
    length: number,
    width: number,
    color: string
  ): Petal => {
    return {
      x: cx,
      y: cy,
      angle,
      length,
      width,
      color,
      opacity: 0,
      rotation: 0,
      swayOffset: Math.random() * Math.PI * 2,
    };
  };

  const createFlower = useCallback(
    (x: number, y: number, baseSize: number, color: string): Flower => {
      const petalCount = randomInt(8, 14);
      const petals: Petal[] = [];
      const petalLength = baseSize * randomRange(0.7, 1.1);
      const petalWidth = baseSize * randomRange(0.28, 0.42);

      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const lengthVariation = randomRange(0.85, 1.15);
        const widthVariation = randomRange(0.85, 1.15);

        petals.push(
          createPetal(
            x,
            y,
            angle,
            petalLength * lengthVariation,
            petalWidth * widthVariation,
            i % 2 === 0 ? color : lightenColor(color, 12)
          )
        );
      }

      return {
        id: generateId(),
        x,
        y,
        centerX: x,
        centerY: y,
        petals,
        centerColor: lightenColor(color, 35),
        petalColor: color,
        size: baseSize,
        bloomProgress: 0,
        createdAt: Date.now(),
        swayPhase: Math.random() * Math.PI * 2,
      };
    },
    []
  );

  const drawPetal = (
    ctx: CanvasRenderingContext2D,
    petal: Petal,
    bloomProgress: number,
    globalSway: number
  ) => {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.angle + globalSway);

    const easedProgress = easeOutBack(Math.min(bloomProgress, 1));
    const length = petal.length * easedProgress;
    const width = petal.width * easedProgress;
    const opacity = Math.min(bloomProgress * 1.5, 1);

    const gradient = ctx.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, withAlpha(petal.color, opacity * 0.9));
    gradient.addColorStop(0.4, withAlpha(lightenColor(petal.color, 20), opacity));
    gradient.addColorStop(0.8, withAlpha(petal.color, opacity * 0.85));
    gradient.addColorStop(1, withAlpha(darkenColor(petal.color, 15), opacity * 0.6));

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const cp1x = length * 0.25;
    const cp1y = -width * 0.5;
    const cp2x = length * 0.65;
    const cp2y = -width * 0.9;
    const endX = length;
    const endY = -width * 0.15;

    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.bezierCurveTo(length * 0.7, width * 0.7, length * 0.25, width * 0.55, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = withAlpha(lightenColor(petal.color, 25), opacity * 0.25);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    const midVeinX = length * 0.6;
    const midVeinY = -width * 0.1;
    ctx.strokeStyle = withAlpha(darkenColor(petal.color, 10), opacity * 0.15);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * 0.3, -width * 0.15, midVeinX, midVeinY);
    ctx.stroke();

    ctx.restore();
  };

  const drawFlower = (
    ctx: CanvasRenderingContext2D,
    flower: Flower,
    time: number
  ) => {
    const sway = Math.sin(time * 0.0008 + flower.swayPhase) * 0.04;
    const bounce = Math.sin(time * 0.0015 + flower.swayPhase * 2) * 2;

    ctx.save();
    ctx.translate(flower.x, flower.y + bounce);
    ctx.rotate(sway * 0.3);

    for (let i = 0; i < flower.petals.length; i++) {
      const petal = flower.petals[i];
      const delay = (i / flower.petals.length) * 0.5;
      const adjustedProgress = Math.max(
        0,
        (flower.bloomProgress - delay) / (1 - delay)
      );
      drawPetal(ctx, petal, adjustedProgress, sway);
    }

    const centerSize = flower.size * 0.28 * easeOutQuad(Math.min(flower.bloomProgress * 1.3, 1));
    if (centerSize > 0) {
      const gradient = createGradient(ctx, 0, 0, centerSize, [
        flower.centerColor,
        lightenColor(flower.centerColor, 15),
        darkenColor(flower.petalColor, 25),
      ]);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = withAlpha('#ffffff', 0.4);
      ctx.beginPath();
      ctx.arc(-centerSize * 0.25, -centerSize * 0.25, centerSize * 0.35, 0, Math.PI * 2);
      ctx.fill();

      const dotCount = Math.floor(centerSize / 3);
      for (let i = 0; i < dotCount; i++) {
        const dotAngle = (i / dotCount) * Math.PI * 2;
        const dotDist = centerSize * 0.5;
        const dotX = Math.cos(dotAngle) * dotDist;
        const dotY = Math.sin(dotAngle) * dotDist;
        ctx.fillStyle = withAlpha(darkenColor(flower.centerColor, 20), 0.6);
        ctx.beginPath();
        ctx.arc(dotX, dotY, centerSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  const drawLeaf = (
    ctx: CanvasRenderingContext2D,
    leaf: Leaf,
    stemColor: string
  ) => {
    const progress = easeOutQuad(leaf.growProgress);
    if (progress <= 0) return;

    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.angle);

    const size = leaf.size * progress;
    const leafColor = lightenColor(stemColor, 20);

    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, withAlpha(darkenColor(leafColor, 10), 0.9));
    gradient.addColorStop(0.5, withAlpha(leafColor, 0.85));
    gradient.addColorStop(1, withAlpha(lightenColor(leafColor, 10), 0.7));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.4, size, 0);
    ctx.quadraticCurveTo(size * 0.5, size * 0.4, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = withAlpha(darkenColor(leafColor, 15), 0.5);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.8, 0);
    ctx.stroke();

    ctx.restore();
  };

  const drawStem = (
    ctx: CanvasRenderingContext2D,
    points: StemPoint[],
    leaves: Leaf[],
    growProgress: number,
    stemColor: string,
    time: number
  ) => {
    if (points.length < 2) return;

    const totalLength = points.length - 1;
    const currentLength = Math.floor(totalLength * growProgress);
    const fraction = (totalLength * growProgress) % 1;

    const stemGradient = ctx.createLinearGradient(
      points[0].x,
      points[0].y,
      points[Math.min(currentLength + 1, totalLength)]?.x || points[0].x,
      points[Math.min(currentLength + 1, totalLength)]?.y || points[0].y
    );
    stemGradient.addColorStop(0, darkenColor(stemColor, 10));
    stemGradient.addColorStop(0.5, stemColor);
    stemGradient.addColorStop(1, lightenColor(stemColor, 10));

    ctx.strokeStyle = stemGradient;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.shadowColor = withAlpha(stemColor, 0.3);
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i <= currentLength && i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }

    if (currentLength < points.length - 1 && fraction > 0) {
      const nextPoint = points[currentLength + 1];
      const lastPoint = points[currentLength];
      const x = lerp(lastPoint.x, nextPoint.x, fraction);
      const y = lerp(lastPoint.y, nextPoint.y, fraction);
      const xc = (lastPoint.x + x) / 2;
      const yc = (lastPoint.y + y) / 2;
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, xc, yc);
    }

    const baseThickness = points[0]?.thickness || 4;
    const tipThickness = points[Math.min(currentLength, points.length - 1)]?.thickness || 2;

    ctx.lineWidth = baseThickness;
    ctx.stroke();

    ctx.shadowBlur = 0;

    const visibleLeafCount = Math.floor(leaves.length * growProgress);
    for (let i = 0; i < visibleLeafCount && i < leaves.length; i++) {
      const leafProgress = Math.min(1, (growProgress - (i / leaves.length)) / (1 / leaves.length));
      const leaf = { ...leaves[i], growProgress: leafProgress };
      drawLeaf(ctx, leaf, stemColor);
    }
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    const opacity = particle.opacity;
    const size = particle.size * opacity;

    if (particle.type === 'petal') {
      const gradient = ctx.createLinearGradient(-size, 0, size, 0);
      gradient.addColorStop(0, withAlpha(particle.color, opacity * 0.5));
      gradient.addColorStop(0.5, withAlpha(particle.color, opacity));
      gradient.addColorStop(1, withAlpha(particle.color, opacity * 0.3));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.type === 'sparkle') {
      const gradient = createGradient(ctx, 0, 0, size, [
        withAlpha('#ffffff', opacity),
        withAlpha(particle.color, opacity * 0.5),
        'transparent',
      ]);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = withAlpha('#ffffff', opacity * 0.8);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-size * 1.5, 0);
      ctx.lineTo(size * 1.5, 0);
      ctx.moveTo(0, -size * 1.5);
      ctx.lineTo(0, size * 1.5);
      ctx.stroke();
    } else if (particle.type === 'trail') {
      const gradient = createGradient(ctx, 0, 0, size, [
        withAlpha(particle.color, opacity),
        'transparent',
      ]);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a1f');
    gradient.addColorStop(0.3, '#1a1540');
    gradient.addColorStop(0.6, '#2d1f5e');
    gradient.addColorStop(1, '#1a1035');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (const star of starsRef.current) {
      const twinkle =
        0.5 +
        0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase);
      const opacity = star.opacity * twinkle;
      const size = star.size * (0.8 + 0.2 * twinkle);

      ctx.fillStyle = withAlpha('#ffffff', opacity);
      ctx.beginPath();
      ctx.arc(star.x % width, star.y % height, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const nebulaGradient = ctx.createRadialGradient(
      width * 0.85,
      height * 0.25,
      0,
      width * 0.85,
      height * 0.25,
      width * 0.6
    );
    nebulaGradient.addColorStop(0, 'rgba(102, 126, 234, 0.12)');
    nebulaGradient.addColorStop(0.4, 'rgba(240, 147, 251, 0.06)');
    nebulaGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, width, height);

    const nebulaGradient2 = ctx.createRadialGradient(
      width * 0.15,
      height * 0.75,
      0,
      width * 0.15,
      height * 0.75,
      width * 0.5
    );
    nebulaGradient2.addColorStop(0, 'rgba(79, 172, 254, 0.1)');
    nebulaGradient2.addColorStop(0.5, 'rgba(0, 242, 254, 0.04)');
    nebulaGradient2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGradient2;
    ctx.fillRect(0, 0, width, height);
  };

  const drawMouseTrail = (
    ctx: CanvasRenderingContext2D,
    mouse: { x: number; y: number },
    isDown: boolean
  ) => {
    if (mouse.x === 0 && mouse.y === 0) return;

    const size = isDown ? 50 : 30;
    const gradient = createGradient(ctx, mouse.x, mouse.y, size, [
      withAlpha(selectedColor, isDown ? 0.5 : 0.25),
      withAlpha(selectedColor, isDown ? 0.15 : 0.08),
      'transparent',
    ]);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, size, 0, Math.PI * 2);
    ctx.fill();

    if (isDown) {
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = randomRange(8, 25);
        const px = mouse.x + Math.cos(angle) * dist;
        const py = mouse.y + Math.sin(angle) * dist;

        addParticle({
          id: generateId(),
          x: px,
          y: py,
          vx: Math.cos(angle) * randomRange(8, 25),
          vy: Math.sin(angle) * randomRange(8, 25) - 15,
          size: randomRange(2, 4),
          color: lightenColor(selectedColor, 20),
          opacity: 1,
          life: 25,
          maxLife: 25,
          type: 'sparkle',
          rotation: 0,
          rotationSpeed: randomRange(-0.08, 0.08),
        });
      }
    }
  };

  const generateLeaves = (points: StemPoint[]): Leaf[] => {
    const leaves: Leaf[] = [];
    if (points.length < 4) return leaves;

    const leafCount = Math.min(5, Math.floor(points.length / 4));
    for (let i = 0; i < leafCount; i++) {
      const pointIndex = Math.floor((i + 1) * (points.length / (leafCount + 1)));
      const point = points[pointIndex];
      const prevPoint = points[Math.max(0, pointIndex - 1)];
      const stemAngle = angle(prevPoint.x, prevPoint.y, point.x, point.y);
      const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
      const leafAngle = stemAngle + (side === 'left' ? -Math.PI / 2.5 : Math.PI / 2.5);

      leaves.push({
        x: point.x,
        y: point.y,
        angle: leafAngle,
        size: randomRange(10, 18),
        side,
        growProgress: 0,
      });
    }

    return leaves;
  };

  const getStemColor = (flowerColor: string): string => {
    const hueShift = 60;
    return darkenColor(lightenColor(flowerColor, hueShift), 30);
  };

  const render = useCallback(
    (deltaTime: number, timestamp: number) => {
      const ctx = getContext();
      if (!ctx || width === 0 || height === 0) return;

      timeRef.current = timestamp;

      clear();
      drawBackground(ctx, width, height, timestamp);

      for (const stem of stems) {
        drawStem(ctx, stem.points, stem.leaves, 1, stem.color, timestamp);
      }

      if (stemPointsRef.current.length > 0 && stemGrowProgressRef.current > 0) {
        const stemColor = getStemColor(selectedColor);
        drawStem(
          ctx,
          stemPointsRef.current,
          stemLeavesRef.current,
          stemGrowProgressRef.current,
          stemColor,
          timestamp
        );
      }

      for (const flower of flowers) {
        if (flower.bloomProgress < 1) {
          const newProgress = Math.min(flower.bloomProgress + deltaTime * 0.8, 1);
          updateFlower(flower.id, { bloomProgress: newProgress });
        }
        drawFlower(ctx, flower, timestamp);
      }

      if (pendingFlowerRef.current && pendingFlowerRef.current.delay <= 0) {
        const { x, y, size, color } = pendingFlowerRef.current;
        const newFlower = createFlower(x, y, size, color);
        addFlower(newFlower);

        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const speed = randomRange(30, 100);
          addParticle({
            id: generateId(),
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 30,
            size: randomRange(4, 8),
            color: i % 2 === 0 ? color : lightenColor(color, 15),
            opacity: 1,
            life: randomRange(50, 90),
            maxLife: 90,
            type: 'petal',
            rotation: angle,
            rotationSpeed: randomRange(-0.05, 0.05),
          });
        }

        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = randomRange(50, 120);
          addParticle({
            id: generateId(),
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 50,
            size: randomRange(2, 5),
            color: lightenColor(color, 30),
            opacity: 1,
            life: randomRange(30, 60),
            maxLife: 60,
            type: 'sparkle',
            rotation: 0,
            rotationSpeed: randomRange(-0.1, 0.1),
          });
        }

        pendingFlowerRef.current = null;
      } else if (pendingFlowerRef.current) {
        pendingFlowerRef.current.delay -= deltaTime;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 40 * deltaTime;
        p.vx *= 1 - 0.4 * deltaTime;
        p.rotation += p.rotationSpeed;
        p.life -= deltaTime * 60;
        p.opacity = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          drawParticle(ctx, p);
        }
      }

      if (mouseRef.current.isDown) {
        drawMouseTrail(ctx, mouseRef.current, true);

        if (stemGrowProgressRef.current < 1) {
          stemGrowProgressRef.current = Math.min(
            1,
            stemGrowProgressRef.current + deltaTime * 2.5
          );
        }
      } else {
        drawMouseTrail(ctx, mouseRef.current, false);
      }
    },
    [
      getContext,
      width,
      height,
      clear,
      flowers,
      particles,
      stems,
      selectedColor,
      flowerSize,
      addFlower,
      addParticle,
      updateFlower,
      createFlower,
    ]
  );

  useAnimationFrame(render, true);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      if (mouseRef.current.isDown) {
        const now = Date.now();
        const lastPoint = stemPointsRef.current[stemPointsRef.current.length - 1];
        const dist = lastPoint
          ? distance(lastPoint.x, lastPoint.y, mouseRef.current.x, mouseRef.current.y)
          : 0;

        if (now - lastAddPointTimeRef.current > 30 && dist > 5) {
          const prevPoint = stemPointsRef.current[stemPointsRef.current.length - 1];
          const prevThickness = prevPoint?.thickness || 5;
          const newThickness = Math.max(2, prevThickness * 0.98);

          const swayOffset = Math.sin(now * 0.003 + stemPointsRef.current.length * 0.5) * 3;

          stemPointsRef.current.push({
            x: mouseRef.current.x + swayOffset,
            y: mouseRef.current.y,
            thickness: newThickness,
          });

          if (stemPointsRef.current.length % 5 === 0) {
            stemLeavesRef.current = generateLeaves(stemPointsRef.current);
          }

          lastAddPointTimeRef.current = now;
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseRef.current.x = x;
      mouseRef.current.y = y;
      mouseRef.current.startX = x;
      mouseRef.current.startY = y;
      mouseRef.current.isDown = true;

      stemPointsRef.current = [
        { x, y, thickness: 5 },
      ];
      stemLeavesRef.current = [];
      stemGrowProgressRef.current = 0;
      lastAddPointTimeRef.current = Date.now();
      pendingFlowerRef.current = null;

      setIsDrawing(true);
      setCursorType('draw');
    }
  };

  const handleMouseUp = () => {
    if (mouseRef.current.isDown && stemPointsRef.current.length > 2) {
      const lastPoint = stemPointsRef.current[stemPointsRef.current.length - 1];
      const firstPoint = stemPointsRef.current[0];
      const stemLength = distance(firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);
      const sizeMultiplier = lerp(0.6, 1.4, Math.min(stemLength / 200, 1));

      const stemColor = getStemColor(selectedColor);
      const completedStem: Stem = {
        id: generateId(),
        points: [...stemPointsRef.current],
        color: stemColor,
        leaves: [...stemLeavesRef.current],
        growProgress: 1,
        targetGrowProgress: 1,
      };
      addStem(completedStem);

      pendingFlowerRef.current = {
        x: lastPoint.x,
        y: lastPoint.y,
        size: flowerSize * sizeMultiplier,
        color: selectedColor,
        delay: 0.15,
      };

      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(20, 60);
        addParticle({
          id: generateId(),
          x: lastPoint.x,
          y: lastPoint.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          size: randomRange(3, 6),
          color: lightenColor(selectedColor, 20),
          opacity: 1,
          life: randomRange(40, 70),
          maxLife: 70,
          type: 'sparkle',
          rotation: 0,
          rotationSpeed: randomRange(-0.08, 0.08),
        });
      }
    }

    stemPointsRef.current = [];
    stemLeavesRef.current = [];
    stemGrowProgressRef.current = 0;
    mouseRef.current.isDown = false;
    setIsDrawing(false);
    setCursorType('default');
  };

  const handleMouseEnter = () => {
    onMouseEnter?.();
    setCursorType('hover');
  };

  const handleMouseLeave = () => {
    onMouseLeave?.();
    handleMouseUp();
    setCursorType('default');
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            mouseRef.current.x = x;
            mouseRef.current.y = y;
            mouseRef.current.startX = x;
            mouseRef.current.startY = y;
            mouseRef.current.isDown = true;

            stemPointsRef.current = [{ x, y, thickness: 5 }];
            stemLeavesRef.current = [];
            stemGrowProgressRef.current = 0;
            lastAddPointTimeRef.current = Date.now();
            setIsDrawing(true);
          }
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;

            if (mouseRef.current.isDown) {
              const now = Date.now();
              const lastPoint = stemPointsRef.current[stemPointsRef.current.length - 1];
              const dist = lastPoint
                ? distance(lastPoint.x, lastPoint.y, mouseRef.current.x, mouseRef.current.y)
                : 0;

              if (now - lastAddPointTimeRef.current > 30 && dist > 5) {
                const prevPoint = stemPointsRef.current[stemPointsRef.current.length - 1];
                const prevThickness = prevPoint?.thickness || 5;
                const newThickness = Math.max(2, prevThickness * 0.98);

                stemPointsRef.current.push({
                  x: mouseRef.current.x,
                  y: mouseRef.current.y,
                  thickness: newThickness,
                });

                if (stemPointsRef.current.length % 5 === 0) {
                  stemLeavesRef.current = generateLeaves(stemPointsRef.current);
                }

                lastAddPointTimeRef.current = now;
              }
            }
          }
        }}
        onTouchEnd={handleMouseUp}
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none text-center">
        {isDrawing ? '继续拖动，让花朵绽放得更远 ✨' : '按住鼠标并拖动，花朵会在终点绽放'}
      </div>
    </div>
  );
};
