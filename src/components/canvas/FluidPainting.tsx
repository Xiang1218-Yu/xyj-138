import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { FluidParticle } from '@/types/fluid';
import { generateId, randomRange, clamp } from '@/utils/math';
import { hexToRgb, mixColors, rgbToRgbaString, RGB } from '@/utils/colors';

interface FluidPaintingProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FluidPainting: React.FC<FluidPaintingProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const { canvasRef, getContext, width, height, clear } = useCanvas();
  const {
    fluid: {
      particles,
      selectedColor,
      viscosity,
      flowRate,
      brushSize,
      blowStrength,
      tool,
      backgroundColor,
    },
    addFluidParticle,
    setCursorType,
  } = useAppStore();

  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isDown: false, velocity: { x: 0, y: 0 } });
  const particlesRef = useRef<FluidParticle[]>([]);
  const timeRef = useRef(0);
  const lastPourTimeRef = useRef(0);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    if (width > 0 && height > 0 && !trailCanvasRef.current) {
      const trailCanvas = document.createElement('canvas');
      trailCanvas.width = width;
      trailCanvas.height = height;
      trailCanvasRef.current = trailCanvas;
      
      const trailCtx = trailCanvas.getContext('2d');
      if (trailCtx) {
        trailCtx.fillStyle = backgroundColor;
        trailCtx.fillRect(0, 0, width, height);
      }
    }
  }, [width, height, backgroundColor]);

  const createParticle = useCallback(
    (x: number, y: number, vx: number = 0, vy: number = 0, customColor?: string): FluidParticle => {
      const colorHex = customColor || selectedColor;
      const rgb = hexToRgb(colorHex);
      const size = randomRange(brushSize * 0.3, brushSize * 0.7);
      
      return {
        id: generateId(),
        x,
        y,
        vx: vx + randomRange(-2, 2),
        vy: vy + randomRange(-2, 2),
        color: colorHex,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        size,
        life: 1,
        maxLife: randomRange(200, 400),
        viscosity: viscosity / 100,
      };
    },
    [selectedColor, brushSize, viscosity]
  );

  const pourParticles = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      const pourInterval = Math.max(16, 100 - flowRate);
      
      if (now - lastPourTimeRef.current < pourInterval) return;
      lastPourTimeRef.current = now;

      const particleCount = Math.floor(flowRate / 20) + 1;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = randomRange(0, Math.PI * 2);
        const dist = randomRange(0, brushSize * 0.5);
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        
        const velocity = {
          x: mouseRef.current.velocity.x * 0.3 + randomRange(-1, 1),
          y: mouseRef.current.velocity.y * 0.3 + randomRange(-1, 1),
        };
        
        const particle = createParticle(px, py, velocity.x, velocity.y);
        addFluidParticle(particle);
      }
    },
    [flowRate, brushSize, createParticle, addFluidParticle]
  );

  const applyBlowForce = useCallback(
    (x: number, y: number) => {
      const blowRadius = brushSize * 3;
      const blowForce = blowStrength / 20;
      const mouseVel = mouseRef.current.velocity;

      particlesRef.current.forEach((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < blowRadius) {
          const forceFactor = 1 - dist / blowRadius;
          const angle = Math.atan2(dy, dx);
          
          const dirX = mouseVel.x !== 0 || mouseVel.y !== 0 
            ? mouseVel.x / Math.sqrt(mouseVel.x ** 2 + mouseVel.y ** 2)
            : Math.cos(angle);
          const dirY = mouseVel.x !== 0 || mouseVel.y !== 0
            ? mouseVel.y / Math.sqrt(mouseVel.x ** 2 + mouseVel.y ** 2)
            : Math.sin(angle);

          p.vx += dirX * blowForce * forceFactor * 5;
          p.vy += dirY * blowForce * forceFactor * 5;
        }
      });
    },
    [brushSize, blowStrength]
  );

  const mixParticles = useCallback(
    (x: number, y: number) => {
      const mixRadius = brushSize * 2;
      
      particlesRef.current.forEach((p, i) => {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mixRadius && p.life > 0.3) {
          const forceFactor = 1 - dist / mixRadius;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          
          p.vx += Math.cos(angle) * forceFactor * 3;
          p.vy += Math.sin(angle) * forceFactor * 3;

          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p2 = particlesRef.current[j];
            const dx2 = p.x - p2.x;
            const dy2 = p.y - p2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (dist2 < p.size + p2.size) {
              const mixRatio = 0.02 * forceFactor;
              const color1: RGB = { r: p.r, g: p.g, b: p.b };
              const color2: RGB = { r: p2.r, g: p2.g, b: p2.b };
              
              const mixed1 = mixColors(color1, color2, mixRatio);
              const mixed2 = mixColors(color2, color1, mixRatio);
              
              p.r = mixed1.r;
              p.g = mixed1.g;
              p.b = mixed1.b;
              
              p2.r = mixed2.r;
              p2.g = mixed2.g;
              p2.b = mixed2.b;

              const overlap = (p.size + p2.size - dist2) / 2;
              const nx = dx2 / dist2;
              const ny = dy2 / dist2;
              
              p.x += nx * overlap * 0.5;
              p.y += ny * overlap * 0.5;
              p2.x -= nx * overlap * 0.5;
              p2.y -= ny * overlap * 0.5;

              const relVelX = p.vx - p2.vx;
              const relVelY = p.vy - p2.vy;
              const velAlongNormal = relVelX * nx + relVelY * ny;

              if (velAlongNormal > 0) continue;

              const restitution = 0.3;
              const impulse = -(1 + restitution) * velAlongNormal / 2;
              
              p.vx += impulse * nx;
              p.vy += impulse * ny;
              p2.vx -= impulse * nx;
              p2.vy -= impulse * ny;
            }
          }
        }
      });
    },
    [brushSize]
  );

  const updateParticles = useCallback(
    (deltaTime: number) => {
      const gravity = 0.15;
      const frictionFactor = 1 - (viscosity / 100) * 0.05;

      particlesRef.current.forEach((p) => {
        p.vy += gravity;

        p.vx *= frictionFactor;
        p.vy *= frictionFactor;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < p.size) {
          p.x = p.size;
          p.vx *= -0.5;
        }
        if (p.x > width - p.size) {
          p.x = width - p.size;
          p.vx *= -0.5;
        }
        if (p.y < p.size) {
          p.y = p.size;
          p.vy *= -0.5;
        }
        if (p.y > height - p.size) {
          p.y = height - p.size;
          p.vy *= -0.3;
          p.vx *= 0.9;
        }

        p.life -= deltaTime * 0.02;
      });

      if (trailCanvasRef.current) {
        const trailCtx = trailCanvasRef.current.getContext('2d');
        if (trailCtx) {
          trailCtx.fillStyle = `${backgroundColor}08`;
          trailCtx.fillRect(0, 0, width, height);

          particlesRef.current.forEach((p) => {
            if (p.life <= 0) return;

            const alpha = clamp(p.life, 0, 1) * 0.8;
            const rgb: RGB = { r: p.r, g: p.g, b: p.b };
            
            const gradient = trailCtx.createRadialGradient(
              p.x, p.y, 0,
              p.x, p.y, p.size
            );
            gradient.addColorStop(0, rgbToRgbaString(rgb, alpha));
            gradient.addColorStop(0.6, rgbToRgbaString(rgb, alpha * 0.6));
            gradient.addColorStop(1, 'transparent');

            trailCtx.fillStyle = gradient;
            trailCtx.beginPath();
            trailCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            trailCtx.fill();
          });
        }
      }
    },
    [viscosity, width, height, backgroundColor]
  );

  const render = useCallback(
    (deltaTime: number, timestamp: number) => {
      const ctx = getContext();
      if (!ctx || width === 0 || height === 0) return;

      timeRef.current = timestamp;

      const mouseVel = {
        x: mouseRef.current.x - mouseRef.current.prevX,
        y: mouseRef.current.y - mouseRef.current.prevY,
      };
      mouseRef.current.velocity = {
        x: mouseRef.current.velocity.x * 0.8 + mouseVel.x * 0.2,
        y: mouseRef.current.velocity.y * 0.8 + mouseVel.y * 0.2,
      };
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;

      if (mouseRef.current.isDown) {
        if (tool === 'pour') {
          pourParticles(mouseRef.current.x, mouseRef.current.y);
        } else if (tool === 'blow') {
          applyBlowForce(mouseRef.current.x, mouseRef.current.y);
        } else if (tool === 'mix') {
          mixParticles(mouseRef.current.x, mouseRef.current.y);
        }
      }

      updateParticles(deltaTime);

      clear();

      if (trailCanvasRef.current) {
        ctx.drawImage(trailCanvasRef.current, 0, 0);
      }

      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        const cursorRadius = tool === 'blow' ? brushSize * 3 : tool === 'mix' ? brushSize * 2 : brushSize;
        
        const cursorGradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, cursorRadius
        );
        
        if (tool === 'pour') {
          const rgb = hexToRgb(selectedColor);
          cursorGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
          cursorGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
          cursorGradient.addColorStop(1, 'transparent');
        } else if (tool === 'blow') {
          cursorGradient.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
          cursorGradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.1)');
          cursorGradient.addColorStop(1, 'transparent');
        } else {
          cursorGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          cursorGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
          cursorGradient.addColorStop(1, 'transparent');
        }
        
        ctx.fillStyle = cursorGradient;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, cursorRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    [
      getContext,
      width,
      height,
      clear,
      tool,
      selectedColor,
      brushSize,
      pourParticles,
      applyBlowForce,
      mixParticles,
      updateParticles,
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
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
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

  useEffect(() => {
    if (trailCanvasRef.current && width > 0 && height > 0) {
      trailCanvasRef.current.width = width;
      trailCanvasRef.current.height = height;
      const trailCtx = trailCanvasRef.current.getContext('2d');
      if (trailCtx) {
        trailCtx.fillStyle = backgroundColor;
        trailCtx.fillRect(0, 0, width, height);
      }
    }
  }, [width, height, backgroundColor]);

  useEffect(() => {
    if (particles.length === 0 && trailCanvasRef.current) {
      const trailCtx = trailCanvasRef.current.getContext('2d');
      if (trailCtx) {
        trailCtx.fillStyle = backgroundColor;
        trailCtx.fillRect(0, 0, width, height);
      }
    }
  }, [particles.length, backgroundColor, width, height]);

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
            mouseRef.current.prevX = mouseRef.current.x;
            mouseRef.current.prevY = mouseRef.current.y;
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
          {tool === 'pour' && (mouseRef.current.isDown
            ? '正在倾倒颜料，尽情创作吧 🎨'
            : '按住并移动鼠标倾倒颜料')}
          {tool === 'blow' && (mouseRef.current.isDown
            ? '正在吹气，推动颜料流动 💨'
            : '按住并移动鼠标吹气推动颜料')}
          {tool === 'mix' && (mouseRef.current.isDown
            ? '正在混合颜色，创造新色调 🌈'
            : '按住并移动鼠标混合颜料')}
        </div>
        <div className="text-xs mt-1">调整粘稠度和流速获得不同效果</div>
      </div>
    </div>
  );
};
