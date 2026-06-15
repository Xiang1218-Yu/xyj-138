import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { KaleidoscopeStroke, Point, SymmetryMode, ColorMode } from '@/types/kaleidoscope';
import { generateId, degToRad } from '@/utils/math';
import { createLinearGradient } from '@/utils/colors';

interface KaleidoscopeProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Kaleidoscope: React.FC<KaleidoscopeProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const { canvasRef, getContext, width, height, clear } = useCanvas();
  const {
    kaleidoscope: {
      symmetryAxes,
      symmetryMode,
      brushSize,
      strokeColor,
      strokeColorMode,
      strokeGradientColors,
      backgroundColor,
      backgroundColorMode,
      backgroundGradientColors,
      showGuides,
      strokes,
      currentStroke,
      rotation,
      animateRotation,
      rotationSpeed,
    },
    setKaleidoscopeCurrentStroke,
    addPointToCurrentStroke,
    addKaleidoscopeStroke,
    setKaleidoscopeIsDrawing,
    setCursorType,
    setKaleidoscopeRotation,
  } = useAppStore();

  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const strokesRef = useRef<KaleidoscopeStroke[]>([]);
  const currentStrokeRef = useRef<KaleidoscopeStroke | null>(null);
  const rotationRef = useRef(rotation);

  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    currentStrokeRef.current = currentStroke;
  }, [currentStroke]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const mirrorPoint = useCallback(
    (point: Point, angle: number, centerX: number, centerY: number): Point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const currentAngle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mirroredAngle = 2 * angle - currentAngle;
      return {
        x: centerX + dist * Math.cos(mirroredAngle),
        y: centerY + dist * Math.sin(mirroredAngle),
      };
    },
    []
  );

  const rotatePoint = useCallback(
    (point: Point, centerX: number, centerY: number, angle: number): Point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos,
      };
    },
    []
  );

  const generateSymmetricPoints = useCallback(
    (
      points: Point[],
      axes: number,
      mode: SymmetryMode,
      centerX: number,
      centerY: number
    ): Point[][] => {
      const allPaths: Point[][] = [];
      const angleStep = (Math.PI * 2) / axes;

      if (mode === 'mirror') {
        for (let i = 0; i < axes; i++) {
          const axisAngle = i * angleStep;
          const mirrored = points.map((p) => mirrorPoint(p, axisAngle, centerX, centerY));
          allPaths.push(mirrored);
        }
      } else if (mode === 'rotate') {
        for (let i = 0; i < axes; i++) {
          const rotateAngle = i * angleStep;
          const rotated = points.map((p) => rotatePoint(p, centerX, centerY, rotateAngle));
          allPaths.push(rotated);
        }
      } else if (mode === 'mirrorRotate') {
        const halfAxes = Math.ceil(axes / 2);
        for (let i = 0; i < halfAxes; i++) {
          const rotateAngle = i * angleStep * 2;
          const rotated = points.map((p) => rotatePoint(p, centerX, centerY, rotateAngle));
          allPaths.push(rotated);

          if (allPaths.length < axes) {
            const mirrored = rotated.map((p) =>
              mirrorPoint(p, rotateAngle + angleStep / 2, centerX, centerY)
            );
            allPaths.push(mirrored);
          }
        }
      }

      return allPaths.slice(0, axes);
    },
    [mirrorPoint, rotatePoint]
  );

  const getStrokeStyle = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      stroke: KaleidoscopeStroke,
      centerX: number,
      centerY: number
    ): string | CanvasGradient => {
      if (stroke.colorMode === 'solid') {
        return stroke.color;
      } else if (stroke.colorMode === 'gradient' && stroke.gradientColors) {
        return createLinearGradient(
          ctx,
          0,
          0,
          centerX * 2,
          centerY * 2,
          [stroke.gradientColors.color1, stroke.gradientColors.color2]
        );
      } else if (stroke.colorMode === 'rainbow') {
        const colors = [
          '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
          '#0000ff', '#4b0082', '#9400d3', '#ff0000',
        ];
        return createLinearGradient(ctx, 0, 0, centerX * 2, centerY * 2, colors);
      }
      return stroke.color;
    },
    []
  );

  const drawStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      stroke: KaleidoscopeStroke,
      centerX: number,
      centerY: number
    ) => {
      if (stroke.points.length < 2) return;

      const symmetricPaths = generateSymmetricPoints(
        stroke.points,
        symmetryAxes,
        symmetryMode,
        centerX,
        centerY
      );

      ctx.save();
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = getStrokeStyle(ctx, stroke, centerX, centerY);

      symmetricPaths.forEach((pathPoints) => {
        if (pathPoints.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
          const prev = pathPoints[i - 1];
          const curr = pathPoints[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.lineTo(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
        ctx.stroke();
      });

      ctx.restore();
    },
    [symmetryAxes, symmetryMode, generateSymmetricPoints, getStrokeStyle]
  );

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (backgroundColorMode === 'solid') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      } else if (backgroundColorMode === 'gradient') {
        const gradient = ctx.createRadialGradient(
          w / 2, h / 2, 0,
          w / 2, h / 2, Math.max(w, h) / 2
        );
        gradient.addColorStop(0, backgroundGradientColors.color1);
        gradient.addColorStop(1, backgroundGradientColors.color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      } else if (backgroundColorMode === 'rainbow') {
        const colors = [
          '#1a0a2e', '#16213e', '#0f3460', '#533483',
          '#e94560', '#ff6b6b', '#feca57', '#48dbfb',
        ];
        const gradient = ctx.createRadialGradient(
          w / 2, h / 2, 0,
          w / 2, h / 2, Math.max(w, h) / 2
        );
        colors.forEach((color, i) => {
          gradient.addColorStop(i / (colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }
    },
    [backgroundColorMode, backgroundColor, backgroundGradientColors]
  );

  const drawGuides = useCallback(
    (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, w: number, h: number) => {
      const angleStep = (Math.PI * 2) / symmetryAxes;
      const radius = Math.max(w, h) / 2;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      for (let i = 0; i < symmetryAxes; i++) {
        const angle = i * angleStep;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(angle),
          centerY + radius * Math.sin(angle)
        );
        ctx.stroke();
      }

      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(w, h) * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    [symmetryAxes]
  );

  const render = useCallback(
    (deltaTime: number) => {
      const ctx = getContext();
      if (!ctx || width === 0 || height === 0) return;

      if (animateRotation) {
        rotationRef.current += rotationSpeed * deltaTime * 10;
        setKaleidoscopeRotation(rotationRef.current);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      clear();

      drawBackground(ctx, width, height);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(degToRad(rotationRef.current));
      ctx.translate(-centerX, -centerY);

      ctx.save();
      const circleRadius = Math.min(width, height) * 0.48;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.clip();

      strokesRef.current.forEach((stroke) => {
        drawStroke(ctx, stroke, centerX, centerY);
      });

      if (currentStrokeRef.current) {
        drawStroke(ctx, currentStrokeRef.current, centerX, centerY);
      }

      if (showGuides) {
        drawGuides(ctx, centerX, centerY, width, height);
      }

      ctx.restore();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        const cursorGradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, brushSize * 3
        );
        cursorGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        cursorGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = cursorGradient;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, brushSize * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    [
      getContext,
      width,
      height,
      clear,
      animateRotation,
      rotationSpeed,
      drawBackground,
      drawStroke,
      showGuides,
      drawGuides,
      brushSize,
      setKaleidoscopeRotation,
    ]
  );

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

      if (mouseRef.current.isDown) {
        addPointToCurrentStroke(pos);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getRelativePosition(e.clientX, e.clientY);
    if (pos) {
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;
      mouseRef.current.isDown = true;
      setKaleidoscopeIsDrawing(true);
      setCursorType('draw');

      const newStroke: KaleidoscopeStroke = {
        id: generateId(),
        points: [pos],
        color: strokeColor,
        width: brushSize,
        colorMode: strokeColorMode,
        gradientColors: strokeGradientColors,
      };
      setKaleidoscopeCurrentStroke(newStroke);
    }
  };

  const handleMouseUp = () => {
    if (mouseRef.current.isDown && currentStrokeRef.current) {
      addKaleidoscopeStroke(currentStrokeRef.current);
    }
    mouseRef.current.isDown = false;
    setKaleidoscopeIsDrawing(false);
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
        className="w-full h-full touch-none"
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
            mouseRef.current.isDown = true;
            setKaleidoscopeIsDrawing(true);
            setCursorType('draw');
            const newStroke: KaleidoscopeStroke = {
              id: generateId(),
              points: [pos],
              color: strokeColor,
              width: brushSize,
              colorMode: strokeColorMode,
              gradientColors: strokeGradientColors,
            };
            setKaleidoscopeCurrentStroke(newStroke);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const pos = getRelativePosition(touch.clientX, touch.clientY);
          if (pos) {
            mouseRef.current.x = pos.x;
            mouseRef.current.y = pos.y;
            if (mouseRef.current.isDown) {
              addPointToCurrentStroke(pos);
            }
          }
        }}
        onTouchEnd={handleMouseUp}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none text-center">
        <div>
          {mouseRef.current.isDown
            ? '尽情绘制你的万花筒图案吧 ✨'
            : '按住并移动鼠标开始创作'}
        </div>
        <div className="text-xs mt-1">调整对称轴数量和对称模式获得不同效果</div>
      </div>
    </div>
  );
};
