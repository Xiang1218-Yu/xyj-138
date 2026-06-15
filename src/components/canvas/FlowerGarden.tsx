import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { Flower, Petal, Particle, StarParticle } from '@/types/flower';
import {
  generateId,
  randomRange,
  randomInt,
  lerp,
} from '@/utils/math';
import {
  easeOutBack,
  easeOutQuad,
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
      selectedColor,
      flowerSize,
      isDrawing,
      lastFlowerTime,
    },
    addFlower,
    addParticle,
    setIsDrawing,
    updateFlower,
    clearFlowers,
    setCursorType,
  } = useAppStore();

  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const starsRef = useRef<StarParticle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const stars: StarParticle[] = [];
    for (let i = 0; i < 100; i++) {
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
      const petalCount = randomInt(6, 12);
      const petals: Petal[] = [];
      const petalLength = baseSize * randomRange(0.6, 1.0);
      const petalWidth = baseSize * randomRange(0.25, 0.4);

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
            i % 2 === 0 ? color : lightenColor(color, 10)
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
        centerColor: lightenColor(color, 30),
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
    const opacity = petal.opacity * Math.min(bloomProgress * 1.5, 1);

    const gradient = ctx.createLinearGradient(0, 0, length, 0);
    gradient.addColorStop(0, withAlpha(petal.color, opacity * 0.9));
    gradient.addColorStop(0.5, withAlpha(lightenColor(petal.color, 15), opacity));
    gradient.addColorStop(1, withAlpha(darkenColor(petal.color, 10), opacity * 0.7));

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const cp1x = length * 0.3;
    const cp1y = -width * 0.6;
    const cp2x = length * 0.7;
    const cp2y = -width * 0.8;
    const endX = length;
    const endY = 0;

    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.bezierCurveTo(cp2x, -cp2y, cp1x, -cp1y, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = withAlpha(lightenColor(petal.color, 20), opacity * 0.3);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  };

  const drawFlower = (
    ctx: CanvasRenderingContext2D,
    flower: Flower,
    time: number
  ) => {
    const sway = Math.sin(time * 0.001 + flower.swayPhase) * 0.05;

    ctx.save();
    ctx.translate(flower.x, flower.y);
    ctx.rotate(sway * 0.3);

    for (let i = 0; i < flower.petals.length; i++) {
      const petal = flower.petals[i];
      const delay = (i / flower.petals.length) * 0.3;
      const adjustedProgress = Math.max(
        0,
        (flower.bloomProgress - delay) / (1 - delay)
      );
      drawPetal(ctx, petal, adjustedProgress, sway);
    }

    const centerSize = flower.size * 0.25 * easeOutQuad(Math.min(flower.bloomProgress * 1.5, 1));
    if (centerSize > 0) {
      const gradient = createGradient(ctx, 0, 0, centerSize, [
        flower.centerColor,
        lightenColor(flower.centerColor, 20),
        darkenColor(flower.petalColor, 20),
      ]);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = withAlpha('#ffffff', 0.3);
      ctx.beginPath();
      ctx.arc(-centerSize * 0.2, -centerSize * 0.2, centerSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(0.5, '#302b63');
    gradient.addColorStop(1, '#24243e');
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
      width * 0.8,
      height * 0.3,
      0,
      width * 0.8,
      height * 0.3,
      width * 0.5
    );
    nebulaGradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
    nebulaGradient.addColorStop(0.5, 'rgba(240, 147, 251, 0.05)');
    nebulaGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, width, height);

    const nebulaGradient2 = ctx.createRadialGradient(
      width * 0.2,
      height * 0.7,
      0,
      width * 0.2,
      height * 0.7,
      width * 0.4
    );
    nebulaGradient2.addColorStop(0, 'rgba(79, 172, 254, 0.08)');
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

    const size = isDown ? 40 : 25;
    const gradient = createGradient(ctx, mouse.x, mouse.y, size, [
      withAlpha(selectedColor, isDown ? 0.4 : 0.2),
      withAlpha(selectedColor, isDown ? 0.1 : 0.05),
      'transparent',
    ]);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, size, 0, Math.PI * 2);
    ctx.fill();

    if (isDown) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = randomRange(5, 20);
        const px = mouse.x + Math.cos(angle) * dist;
        const py = mouse.y + Math.sin(angle) * dist;

        addParticle({
          id: generateId(),
          x: px,
          y: py,
          vx: Math.cos(angle) * randomRange(10, 30),
          vy: Math.sin(angle) * randomRange(10, 30) - 20,
          size: randomRange(2, 5),
          color: selectedColor,
          opacity: 1,
          life: 30,
          maxLife: 30,
          type: 'sparkle',
          rotation: 0,
          rotationSpeed: randomRange(-0.1, 0.1),
        });
      }
    }
  };

  const render = useCallback(
    (deltaTime: number, timestamp: number) => {
      const ctx = getContext();
      if (!ctx || width === 0 || height === 0) return;

      timeRef.current = timestamp;

      clear();
      drawBackground(ctx, width, height, timestamp);

      for (const flower of flowers) {
        if (flower.bloomProgress < 1) {
          const newProgress = Math.min(flower.bloomProgress + deltaTime * 1.2, 1);
          updateFlower(flower.id, { bloomProgress: newProgress });
        }
        drawFlower(ctx, flower, timestamp);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 50 * deltaTime;
        p.vx *= 1 - 0.5 * deltaTime;
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

        const now = Date.now();
        const dx = mouseRef.current.x - mouseRef.current.lastX;
        const dy = mouseRef.current.y - mouseRef.current.lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (now - lastFlowerTime > 150 && dist > 10) {
          const sizeVariation = lerp(0.7, 1.3, Math.min(dist / 100, 1));
          const newFlower = createFlower(
            mouseRef.current.x,
            mouseRef.current.y,
            flowerSize * sizeVariation,
            selectedColor
          );
          addFlower(newFlower);

          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = randomRange(50, 150);
            addParticle({
              id: generateId(),
              x: mouseRef.current.x,
              y: mouseRef.current.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 50,
              size: randomRange(4, 8),
              color:
                i % 2 === 0 ? selectedColor : lightenColor(selectedColor, 15),
              opacity: 1,
              life: randomRange(40, 80),
              maxLife: 80,
              type: 'petal',
              rotation: angle,
              rotationSpeed: randomRange(-0.05, 0.05),
            });
          }

          mouseRef.current.lastX = mouseRef.current.x;
          mouseRef.current.lastY = mouseRef.current.y;
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
      selectedColor,
      flowerSize,
      lastFlowerTime,
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
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.isDown = true;
      setIsDrawing(true);
      setCursorType('draw');
    }
  };

  const handleMouseUp = () => {
    if (mouseRef.current.isDown) {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomRange(80, 200);
        addParticle({
          id: generateId(),
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 100,
          size: randomRange(3, 6),
          color: lightenColor(selectedColor, 20),
          opacity: 1,
          life: randomRange(60, 120),
          maxLife: 120,
          type: 'sparkle',
          rotation: 0,
          rotationSpeed: randomRange(-0.1, 0.1),
        });
      }
    }
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
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;
            mouseRef.current.lastX = mouseRef.current.x;
            mouseRef.current.lastY = mouseRef.current.y;
            mouseRef.current.isDown = true;
            setIsDrawing(true);
          }
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;
          }
        }}
        onTouchEnd={handleMouseUp}
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none">
        {isDrawing ? '继续拖动，创造更多花朵 ✨' : '按住鼠标并拖动，绽放美丽花朵'}
      </div>
    </div>
  );
};
