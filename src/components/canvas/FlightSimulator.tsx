import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { Cloud, Mountain, ThrustParticle } from '@/types/flight';
import { generateId, randomRange, lerp, lerpAngle, clamp } from '@/utils/math';
import { createGradient, withAlpha, lightenColor } from '@/utils/colors';

interface FlightSimulatorProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FlightSimulator: React.FC<FlightSimulatorProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const { canvasRef, getContext, width, height, clear } = useCanvas();
  const {
    flight: { aircraft, clouds, mountains, thrustParticles, isMouseDown },
    updateAircraft,
    addThrustParticle,
    resetFlight,
    setCursorType,
  } = useAppStore();

  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const aircraftRef = useRef(aircraft);
  const cloudsRef = useRef<Cloud[]>([]);
  const mountainsRef = useRef<Mountain[]>([]);
  const timeRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    aircraftRef.current = aircraft;
  }, [aircraft]);

  const initializeScene = useCallback(
    (w: number, h: number) => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const initialClouds: Cloud[] = [];
      for (let i = 0; i < 8; i++) {
        initialClouds.push({
          x: randomRange(-100, w + 100),
          y: randomRange(50, h * 0.5),
          width: randomRange(100, 250),
          height: randomRange(40, 80),
          speed: randomRange(10, 30),
          opacity: randomRange(0.3, 0.6),
          puffCount: Math.floor(randomRange(3, 6)),
        });
      }
      cloudsRef.current = initialClouds;

      const initialMountains: Mountain[] = [];
      for (let i = 0; i < 5; i++) {
        initialMountains.push({
          x: (i / 5) * w * 1.5,
          height: randomRange(h * 0.3, h * 0.5),
          width: randomRange(w * 0.4, w * 0.8),
          color: `hsl(${220 + i * 5}, 30%, ${15 + i * 3}%)`,
          parallaxSpeed: 20 + i * 10,
        });
      }
      mountainsRef.current = initialMountains;

      updateAircraft({
        x: w * 0.3,
        y: h * 0.6,
        targetX: w * 0.3,
        targetY: h * 0.6,
        fuel: 100,
      });
    },
    [updateAircraft]
  );

  useEffect(() => {
    if (width > 0 && height > 0) {
      initializeScene(width, height);
    }
  }, [width, height, initializeScene]);

  const drawSky = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.3, '#16213e');
    gradient.addColorStop(0.6, '#0f3460');
    gradient.addColorStop(1, '#533483');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const sunGradient = ctx.createRadialGradient(
      w * 0.8,
      h * 0.15,
      0,
      w * 0.8,
      h * 0.15,
      w * 0.5
    );
    sunGradient.addColorStop(0, 'rgba(255, 200, 150, 0.3)');
    sunGradient.addColorStop(0.3, 'rgba(255, 150, 100, 0.1)');
    sunGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGradient;
    ctx.fillRect(0, 0, w, h);

    const stars = 50;
    for (let i = 0; i < stars; i++) {
      const sx = (i * 137.5) % w;
      const sy = (i * 73.7) % (h * 0.4);
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 + i);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.5})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + twinkle * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawMountains = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    offset: number
  ) => {
    for (let i = mountainsRef.current.length - 1; i >= 0; i--) {
      const m = mountainsRef.current[i];
      const x = (m.x - offset * m.parallaxSpeed * 0.01) % (w * 2);
      const adjustedX = x < -m.width ? x + w * 2 : x;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(adjustedX, h);
      ctx.lineTo(adjustedX + m.width * 0.3, h - m.height * 0.6);
      ctx.quadraticCurveTo(
        adjustedX + m.width * 0.5,
        h - m.height,
        adjustedX + m.width * 0.7,
        h - m.height * 0.5
      );
      ctx.lineTo(adjustedX + m.width, h);
      ctx.closePath();
      ctx.fillStyle = m.color;
      ctx.fill();
      ctx.restore();
    }
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, cloud: Cloud) => {
    ctx.save();
    ctx.globalAlpha = cloud.opacity;

    const gradient = ctx.createRadialGradient(
      cloud.x,
      cloud.y,
      0,
      cloud.x,
      cloud.y,
      cloud.width * 0.6
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.6)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;

    for (let i = 0; i < cloud.puffCount; i++) {
      const angle = (i / cloud.puffCount) * Math.PI * 2;
      const dist = cloud.width * 0.25;
      const px = cloud.x + Math.cos(angle) * dist;
      const py = cloud.y + Math.sin(angle) * dist * 0.5;
      const size = cloud.height * (0.5 + Math.sin(i * 1.5) * 0.3);

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawAircraft = (
    ctx: CanvasRenderingContext2D,
    ac: typeof aircraft,
    time: number
  ) => {
    ctx.save();
    ctx.translate(ac.x, ac.y);
    ctx.rotate(ac.angle);

    const scale = 0.8 + ac.speed / ac.maxSpeed * 0.4;
    ctx.scale(scale, scale);

    const bodyGradient = ctx.createLinearGradient(-40, 0, 40, 0);
    bodyGradient.addColorStop(0, '#2d3436');
    bodyGradient.addColorStop(0.5, '#636e72');
    bodyGradient.addColorStop(1, '#2d3436');

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.quadraticCurveTo(30, -15, -30, -12);
    ctx.quadraticCurveTo(-40, 0, -30, 12);
    ctx.quadraticCurveTo(30, 15, 50, 0);
    ctx.fill();

    ctx.fillStyle = '#74b9ff';
    ctx.beginPath();
    ctx.moveTo(25, -8);
    ctx.quadraticCurveTo(40, 0, 25, 8);
    ctx.closePath();
    ctx.fill();

    const wingGradient = ctx.createLinearGradient(0, -30, 0, 30);
    wingGradient.addColorStop(0, '#6c5ce7');
    wingGradient.addColorStop(0.5, '#a29bfe');
    wingGradient.addColorStop(1, '#6c5ce7');

    ctx.fillStyle = wingGradient;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.quadraticCurveTo(-20, -35, -5, -40);
    ctx.quadraticCurveTo(10, -35, 5, -10);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(-20, 35, -5, 40);
    ctx.quadraticCurveTo(10, 35, 5, 10);
    ctx.fill();

    ctx.fillStyle = '#fd79a8';
    ctx.beginPath();
    ctx.moveTo(-30, -5);
    ctx.lineTo(-45, -20);
    ctx.lineTo(-35, 0);
    ctx.lineTo(-45, 20);
    ctx.lineTo(-30, 5);
    ctx.closePath();
    ctx.fill();

    if (ac.isThrusting && ac.fuel > 0) {
      const flameIntensity = 0.5 + 0.5 * Math.sin(time * 0.02);

      const flameGradient = ctx.createLinearGradient(-60, 0, -30, 0);
      flameGradient.addColorStop(0, 'transparent');
      flameGradient.addColorStop(0.3, 'rgba(255, 100, 50, 0.8)');
      flameGradient.addColorStop(0.6, 'rgba(255, 200, 50, 0.9)');
      flameGradient.addColorStop(1, 'rgba(255, 255, 200, 1)');

      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.moveTo(-30, -6);
      ctx.quadraticCurveTo(
        -50 - flameIntensity * 20,
        -8,
        -55 - flameIntensity * 30,
        0
      );
      ctx.quadraticCurveTo(
        -50 - flameIntensity * 20,
        8,
        -30,
        6
      );
      ctx.closePath();
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        const sparkX = -40 - Math.random() * 30;
        const sparkY = (Math.random() - 0.5) * 15;
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(45, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(45, 5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawThrustParticle = (
    ctx: CanvasRenderingContext2D,
    p: ThrustParticle
  ) => {
    const opacity = p.opacity;
    const size = p.size * opacity;

    const gradient = createGradient(ctx, p.x, p.y, size, [
      withAlpha(p.color, opacity),
      'transparent',
    ]);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawHUD = (
    ctx: CanvasRenderingContext2D,
    w: number,
    ac: typeof aircraft
  ) => {
    const padding = 20;
    const barWidth = 150;
    const barHeight = 8;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(padding, padding, barWidth, barHeight + 40);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Outfit, sans-serif';
    ctx.fillText('高度', padding + 5, padding + 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(padding + 5, padding + 20, barWidth - 10, barHeight);
    const altitudePercent = ac.altitude / 100;
    const altitudeGradient = ctx.createLinearGradient(
      padding + 5,
      0,
      padding + 5 + barWidth - 10,
      0
    );
    altitudeGradient.addColorStop(0, '#00f2fe');
    altitudeGradient.addColorStop(1, '#4facfe');
    ctx.fillStyle = altitudeGradient;
    ctx.fillRect(
      padding + 5,
      padding + 20,
      (barWidth - 10) * clamp(altitudePercent, 0, 1),
      barHeight
    );

    const speedY = padding + 45;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('速度', padding + 5, speedY + 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(padding + 5, speedY + 20, barWidth - 10, barHeight);
    const speedPercent = ac.speed / ac.maxSpeed;
    const speedGradient = ctx.createLinearGradient(
      padding + 5,
      0,
      padding + 5 + barWidth - 10,
      0
    );
    speedGradient.addColorStop(0, '#f093fb');
    speedGradient.addColorStop(1, '#f5576c');
    ctx.fillStyle = speedGradient;
    ctx.fillRect(
      padding + 5,
      speedY + 20,
      (barWidth - 10) * speedPercent,
      barHeight
    );

    const fuelX = w - padding - barWidth;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('燃料', fuelX + 5, padding + 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(fuelX + 5, padding + 20, barWidth - 10, barHeight);
    const fuelPercent = ac.fuel / ac.maxFuel;
    const fuelGradient = ctx.createLinearGradient(
      fuelX + 5,
      0,
      fuelX + 5 + (barWidth - 10),
      0
    );
    if (fuelPercent > 0.3) {
      fuelGradient.addColorStop(0, '#43e97b');
      fuelGradient.addColorStop(1, '#38f9d7');
    } else {
      fuelGradient.addColorStop(0, '#fa709a');
      fuelGradient.addColorStop(1, '#fee140');
    }
    ctx.fillStyle = fuelGradient;
    ctx.fillRect(
      fuelX + 5,
      padding + 20,
      (barWidth - 10) * fuelPercent,
      barHeight
    );

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `高度: ${Math.round(ac.altitude)}m | 速度: ${Math.round(ac.speed * 10)}km/h`,
      w / 2,
      padding + 20
    );
    ctx.textAlign = 'left';
  };

  const render = useCallback(
    (deltaTime: number, timestamp: number) => {
      const ctx = getContext();
      if (!ctx || width === 0 || height === 0) return;

      timeRef.current = timestamp;

      clear();

      drawSky(ctx, width, height, timestamp);
      drawMountains(ctx, width, height, timestamp);

      for (let i = cloudsRef.current.length - 1; i >= 0; i--) {
        const cloud = cloudsRef.current[i];
        cloud.x -= cloud.speed * deltaTime;
        if (cloud.x < -cloud.width) {
          cloud.x = width + randomRange(0, 200);
          cloud.y = randomRange(50, height * 0.5);
          cloud.width = randomRange(100, 250);
          cloud.height = randomRange(40, 80);
        }
        drawCloud(ctx, cloud);
      }

      const ac = { ...aircraftRef.current };

      const lerpFactor = 0.08;
      ac.x = lerp(ac.x, mouseRef.current.x || width * 0.5, lerpFactor);
      ac.y = lerp(ac.y, mouseRef.current.y || height * 0.5, lerpFactor);

      const dx = mouseRef.current.x - ac.x;
      const dy = mouseRef.current.y - ac.y;
      const targetAngle = Math.atan2(dy, dx);
      ac.angle = lerpAngle(ac.angle, targetAngle, 0.1);

      if (mouseRef.current.isDown && ac.fuel > 0) {
        const acceleration = 400;
        ac.velocityX += Math.cos(ac.angle) * acceleration * deltaTime;
        ac.velocityY += Math.sin(ac.angle) * acceleration * deltaTime;
        ac.isThrusting = true;
        ac.fuel = Math.max(0, ac.fuel - deltaTime * 5);

        for (let i = 0; i < 2; i++) {
          const spread = (Math.random() - 0.5) * 0.5;
          const particleAngle = ac.angle + Math.PI + spread;
          const speed = randomRange(100, 200);
          addThrustParticle({
            id: generateId(),
            x: ac.x - Math.cos(ac.angle) * 40,
            y: ac.y - Math.sin(ac.angle) * 40,
            vx: Math.cos(particleAngle) * speed,
            vy: Math.sin(particleAngle) * speed,
            size: randomRange(3, 8),
            color: `hsl(${30 + Math.random() * 30}, 100%, 60%)`,
            opacity: 1,
            life: randomRange(20, 40),
            maxLife: 40,
          });
        }
      } else {
        ac.isThrusting = false;
        ac.fuel = Math.min(ac.maxFuel, ac.fuel + deltaTime * 10);
      }

      const drag = 0.98;
      ac.velocityX *= drag;
      ac.velocityY *= drag;

      ac.speed = Math.sqrt(ac.velocityX ** 2 + ac.velocityY ** 2);
      if (ac.speed > ac.maxSpeed * 60) {
        const scale = (ac.maxSpeed * 60) / ac.speed;
        ac.velocityX *= scale;
        ac.velocityY *= scale;
        ac.speed = ac.maxSpeed * 60;
      }

      ac.x += ac.velocityX * deltaTime;
      ac.y += ac.velocityY * deltaTime;

      ac.x = clamp(ac.x, 50, width - 50);
      ac.y = clamp(ac.y, 50, height - 50);

      ac.altitude = (height - ac.y) / (height * 0.01);
      ac.speed = ac.speed / 60;

      for (let i = thrustParticles.length - 1; i >= 0; i--) {
        const p = thrustParticles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= deltaTime * 60;
        p.opacity = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          thrustParticles.splice(i, 1);
        } else {
          drawThrustParticle(ctx, p);
        }
      }

      drawAircraft(ctx, ac, timestamp);
      drawHUD(ctx, width, ac);

      updateAircraft({
        x: ac.x,
        y: ac.y,
        velocityX: ac.velocityX,
        velocityY: ac.velocityY,
        angle: ac.angle,
        speed: ac.speed,
        altitude: ac.altitude,
        fuel: ac.fuel,
        isThrusting: ac.isThrusting,
      });
    },
    [
      getContext,
      width,
      height,
      clear,
      thrustParticles,
      addThrustParticle,
      updateAircraft,
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
    mouseRef.current.isDown = true;
    setCursorType('draw');
    }
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
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
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;
            mouseRef.current.isDown = true;
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;
          }
        }}
        onTouchEnd={handleMouseUp}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none text-center">
        <div>
          {mouseRef.current.isDown
            ? '按住加速，自由翱翔 ✈️'
            : '移动鼠标控制方向，按住加速起飞'}
        </div>
        <div className="text-xs mt-1">松开减速，自动补充燃料</div>
      </div>
    </div>
  );
};
