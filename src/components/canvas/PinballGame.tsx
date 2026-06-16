import React, { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { useAppStore } from '@/store/useAppStore';
import { Ball, ExplosionParticle, CelebrationParticle } from '@/types/pinball';
import { generateId, randomRange, lerp, clamp } from '@/utils/math';
import { withAlpha, lightenColor, darkenColor } from '@/utils/colors';

interface PinballGameProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const PinballGame: React.FC<PinballGameProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const { canvasRef, getContext, width, height, clear } = useCanvas();
  const {
    pinball: {
      balls,
      activeBall,
      curvedBoard,
      bridge,
      hole,
      launcher,
      explosionParticles,
      celebrationParticles,
      score,
      isCelebrating,
    },
    addPinballBall,
    updatePinballBall,
    removePinballBall,
    setActivePinball,
    updateCurvedBoard,
    addExplosionParticle,
    addCelebrationParticle,
    setPinballScore,
    setPinballCelebrating,
    setPinballCelebrationTimer,
    updateLauncher,
    setCursorType,
  } = useAppStore();

  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const sceneRef = useRef({
    balls: [] as Ball[],
    activeBall: null as Ball | null,
    curvedBoard: { ...curvedBoard },
    bridge: { ...bridge },
    hole: { ...hole },
    launcher: { ...launcher },
    explosionParticles: [] as ExplosionParticle[],
    celebrationParticles: [] as CelebrationParticle[],
    score: 0,
    isCelebrating: false,
    celebrationTimer: 0,
  });
  const timeRef = useRef(0);
  const initializedRef = useRef(false);
  const gravityRef = useRef(800);

  const project3D = useCallback(
    (point: Point3D, w: number, h: number): { x: number; y: number; scale: number } => {
      const cameraDistance = 800;
      const cameraY = -h * 0.3;
      const zScale = cameraDistance / (cameraDistance + point.z + 200);
      const screenX = w / 2 + (point.x - w / 2) * zScale;
      const screenY = h / 2 + (point.y - h / 2 + cameraY) * zScale * 0.8;
      return { x: screenX, y: screenY, scale: zScale };
    },
    []
  );

  const initializeScene = useCallback(
    (w: number, h: number, force = false) => {
      if (initializedRef.current && !force) return;
      initializedRef.current = true;

      sceneRef.current.curvedBoard = {
        x: w * 0.42,
        y: h * 0.62,
        angle: 0,
        targetAngle: 0,
        width: 200,
        height: 200,
        curveRadius: 100,
      };

      sceneRef.current.bridge = {
        x: w * 0.65,
        y: h * 0.5,
        width: 340,
        height: 30,
        z: 30,
      };

      sceneRef.current.hole = {
        x: w * 0.88,
        y: h * 0.47,
        radius: 50,
        z: 70,
      };

      sceneRef.current.launcher = {
        x: w * 0.12,
        y: h * 0.75,
        width: 70,
        height: 140,
        power: 0,
        maxPower: 100,
        isCharging: false,
        chargeProgress: 0,
      };

      updateCurvedBoard(sceneRef.current.curvedBoard);
      updateLauncher(sceneRef.current.launcher);
    },
    [updateCurvedBoard, updateLauncher]
  );

  useEffect(() => {
    if (width > 0 && height > 0) {
      initializeScene(width, height);
    }
  }, [width, height, initializeScene]);

  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (prevScoreRef.current > 0 && score === 0 && width > 0 && height > 0) {
      initializedRef.current = false;
      initializeScene(width, height, true);
    }
    prevScoreRef.current = score;
  }, [score, width, height, initializeScene]);

  useEffect(() => {
    sceneRef.current.balls = balls;
    sceneRef.current.activeBall = activeBall;
    sceneRef.current.curvedBoard = curvedBoard;
    sceneRef.current.bridge = bridge;
    sceneRef.current.hole = hole;
    sceneRef.current.launcher = launcher;
    sceneRef.current.explosionParticles = explosionParticles;
    sceneRef.current.celebrationParticles = celebrationParticles;
    sceneRef.current.score = score;
    sceneRef.current.isCelebrating = isCelebrating;
  }, [balls, activeBall, curvedBoard, bridge, hole, launcher, explosionParticles, celebrationParticles, score, isCelebrating]);

  const createExplosion = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 25; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(150, 400);
      addExplosionParticle({
        id: generateId(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: randomRange(4, 12),
        color: i % 3 === 0 ? '#ffeb3b' : color,
        opacity: 1,
        life: randomRange(30, 60),
        maxLife: 60,
      });
    }
  }, [addExplosionParticle]);

  const createCelebration = useCallback((x: number, y: number) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
    
    for (let i = 0; i < 80; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(200, 500);
      const types: ('confetti' | 'star' | 'sparkle')[] = ['confetti', 'star', 'sparkle'];
      
      addCelebrationParticle({
        id: generateId(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 200,
        size: randomRange(6, 18),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        life: randomRange(80, 150),
        maxLife: 150,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: randomRange(0, Math.PI * 2),
        rotationSpeed: randomRange(-10, 10),
      });
    }
  }, [addCelebrationParticle]);

  const launchBall = useCallback(() => {
    const scene = sceneRef.current;
    const power = scene.launcher.chargeProgress / 100;
    const launchPower = power * 500 + 200;

    if (scene.balls.length > 0) {
      scene.balls.forEach((ball) => {
        if (ball.isActive) {
          createExplosion(
            project3D({ x: ball.x, y: ball.y, z: ball.z }, width, height).x,
            project3D({ x: ball.x, y: ball.y, z: ball.z }, width, height).y,
            ball.color
          );
          removePinballBall(ball.id);
        }
      });
      scene.balls = [];
    }

    const newBall: Ball = {
      id: generateId(),
      x: scene.launcher.x,
      y: scene.launcher.y - 60,
      z: 0,
      vx: launchPower * 0.65,
      vy: -launchPower * 0.5,
      vz: launchPower * 0.25,
      radius: 22,
      color: '#ff6b6b',
      isActive: true,
      rotation: 0,
    };

    addPinballBall(newBall);
    setActivePinball(newBall);
    scene.balls = [newBall];
    scene.activeBall = newBall;
  }, [addPinballBall, setActivePinball, createExplosion, removePinballBall, project3D, width, height]);

  const checkCollisionWithCurvedBoard = useCallback((ball: Ball, board: typeof curvedBoard): Ball => {
    const boardRadius = board.width / 2;
    const dx = ball.x - board.x;
    const dy = ball.y - board.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionRadius = boardRadius + ball.radius;

    if (distance < collisionRadius && distance > 0) {
      const nx = dx / distance;
      const ny = dy / distance;

      const tangentX = -ny;
      const tangentY = nx;

      const rotationSpeed = board.angle * 180;

      const relativeVx = ball.vx + rotationSpeed * tangentX;
      const relativeVy = ball.vy + rotationSpeed * tangentY;

      const dotProduct = relativeVx * nx + relativeVy * ny;

      if (dotProduct < 0) {
        const restitution = 0.9;
        ball.vx = (relativeVx - 2 * dotProduct * nx) * restitution + rotationSpeed * tangentX * 1.2;
        ball.vy = (relativeVy - 2 * dotProduct * ny) * restitution + rotationSpeed * tangentY * 1.2;

        const overlap = collisionRadius - distance;
        ball.x += nx * overlap * 1.1;
        ball.y += ny * overlap * 1.1;
        
        ball.vz += Math.abs(board.angle) * 50 + 20;
      }
    }

    return ball;
  }, []);

  const checkCollisionWithBridge = useCallback((ball: Ball, bridgeData: typeof bridge): Ball => {
    const bridgeStartX = bridgeData.x - bridgeData.width / 2;
    const bridgeEndX = bridgeData.x + bridgeData.width / 2;
    const bridgeLength = bridgeEndX - bridgeStartX;
    
    if (ball.x < bridgeStartX - ball.radius * 2 || ball.x > bridgeEndX + ball.radius * 2) {
      return ball;
    }

    const progress = (ball.x - bridgeStartX) / bridgeLength;
    const clampedProgress = clamp(progress, 0, 1);
    
    const bridgeYAtX = bridgeData.y - clampedProgress * 20;
    const bridgeZAtX = bridgeData.z + clampedProgress * 50;
    
    const zDistance = Math.abs(ball.z - bridgeZAtX);
    
    if (zDistance < 80) {
      const bridgeTop = bridgeYAtX - bridgeData.height / 2;
      
      if (ball.y > bridgeTop - ball.radius * 1.5 && ball.y < bridgeTop + bridgeData.height + 20) {
        if (ball.vy > 0 || Math.abs(ball.y - bridgeTop) < ball.radius) {
          ball.y = bridgeTop - ball.radius;
          ball.vy = Math.min(ball.vy * -0.2, 50);
          ball.vx = Math.max(ball.vx, 40);
          
          if (ball.vx < 120) {
            ball.vx += 15;
          }
          
          ball.vx *= 0.99;
          ball.z = bridgeZAtX + 10;
        }
      }
      
      if (Math.abs(ball.y - bridgeTop) < ball.radius * 2) {
        ball.vz *= 0.9;
        
        if (ball.x < bridgeStartX + 30 && ball.vx < 0) {
          ball.vx = Math.abs(ball.vx) * 0.6 + 40;
        }
      }
    }

    return ball;
  }, []);

  const checkHoleCollision = useCallback((ball: Ball, holeData: typeof hole): boolean => {
    const dx = ball.x - holeData.x;
    const dy = ball.y - holeData.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const dz = Math.abs(ball.z - holeData.z);
    
    if (dz < 80 && distance < holeData.radius + ball.radius) {
      if (ball.y > holeData.y - holeData.radius * 1.5) {
        return true;
      }
    }
    
    if (dz < 50 && distance < holeData.radius * 0.8) {
      return true;
    }
    
    if (distance < holeData.radius * 0.6) {
      return true;
    }
    
    return false;
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const stars = 100;
    for (let i = 0; i < stars; i++) {
      const sx = (i * 137.5) % w;
      const sy = (i * 73.7) % (h * 0.5);
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 + i * 0.5);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.5})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + twinkle, 0, Math.PI * 2);
      ctx.fill();
    }

    const floorGradient = ctx.createLinearGradient(0, h * 0.5, 0, h);
    floorGradient.addColorStop(0, 'rgba(233, 69, 96, 0.1)');
    floorGradient.addColorStop(0.5, 'rgba(233, 69, 96, 0.2)');
    floorGradient.addColorStop(1, 'rgba(233, 69, 96, 0.3)');
    ctx.fillStyle = floorGradient;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    const gridLines = 15;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = h * 0.55 + (i / gridLines) * h * 0.45;
      const perspective = 1 - (i / gridLines) * 0.5;
      const startX = w * 0.5 - (w * 0.45 * perspective);
      const endX = w * 0.5 + (w * 0.45 * perspective);
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }, []);

  const drawCurvedBoard = useCallback((ctx: CanvasRenderingContext2D, board: typeof curvedBoard, w: number, h: number) => {
    const { x, y } = project3D({ x: board.x, y: board.y, z: 30 }, w, h);
    const scale = project3D({ x: board.x, y: board.y, z: 30 }, w, h).scale;
    
    const radius = (board.width / 2) * scale;
    const angle = board.angle;

    ctx.save();
    ctx.translate(x, y);

    const shadowGradient = ctx.createRadialGradient(0, radius * 0.6, 0, 0, radius * 0.6, radius * 1.2);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    shadowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.5, radius * 1.1, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(angle * 0.3);

    const boardGradient = ctx.createRadialGradient(-radius * 0.2, -radius * 0.2, 0, 0, 0, radius);
    boardGradient.addColorStop(0, '#a29bfe');
    boardGradient.addColorStop(0.3, '#74b9ff');
    boardGradient.addColorStop(0.6, '#6c5ce7');
    boardGradient.addColorStop(1, '#4834d4');

    ctx.fillStyle = boardGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    const ringGradient = ctx.createRadialGradient(0, 0, radius * 0.85, 0, 0, radius);
    ringGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    ringGradient.addColorStop(0.5, '#6c5ce7');
    ringGradient.addColorStop(1, '#4834d4');
    ctx.fillStyle = ringGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.rotate(angle);
    const arrowGradient = ctx.createLinearGradient(0, -radius * 0.6, 0, radius * 0.6);
    arrowGradient.addColorStop(0, '#ffeaa7');
    arrowGradient.addColorStop(1, '#fdcb6e');
    ctx.fillStyle = arrowGradient;
    
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.7);
    ctx.lineTo(radius * 0.15, -radius * 0.45);
    ctx.lineTo(-radius * 0.15, -radius * 0.45);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.7);
    ctx.lineTo(radius * 0.15, radius * 0.45);
    ctx.lineTo(-radius * 0.15, radius * 0.45);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.45);
    ctx.lineTo(0, radius * 0.45);
    ctx.stroke();
    ctx.restore();

    const highlightGradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, -radius * 0.3, -radius * 0.3, radius * 0.6);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    highlightGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(-radius * 0.25, -radius * 0.25, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#a29bfe';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = 'rgba(162, 155, 254, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
    ctx.restore();
  }, [project3D]);

  const drawBridge = useCallback((ctx: CanvasRenderingContext2D, bridgeData: typeof bridge, w: number, h: number) => {
    const segments = 12;
    
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const zOffset = t * 50 + bridgeData.z;
      const yOffset = -t * 15;
      const xOffset = t * 10;
      
      const pos = project3D({ x: bridgeData.x + xOffset, y: bridgeData.y + yOffset, z: zOffset }, w, h);
      const scale = pos.scale;
      const width = bridgeData.width * scale * (0.95 + t * 0.1);
      const height = bridgeData.height * scale;

      const plankGradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
      plankGradient.addColorStop(0, '#8b5a2b');
      plankGradient.addColorStop(0.2, '#cd853f');
      plankGradient.addColorStop(0.5, '#daa520');
      plankGradient.addColorStop(0.8, '#8b5a2b');
      plankGradient.addColorStop(1, '#654321');

      ctx.fillStyle = plankGradient;
      ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1;
      const plankCount = 8;
      for (let j = 0; j <= plankCount; j++) {
        const plankX = pos.x - width / 2 + (j / plankCount) * width;
        ctx.beginPath();
        ctx.moveTo(plankX, pos.y - height / 2);
        ctx.lineTo(plankX, pos.y + height / 2);
        ctx.stroke();
      }

      const sideGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      sideGradient.addColorStop(0, '#654321');
      sideGradient.addColorStop(1, '#3d2817');
      ctx.fillStyle = sideGradient;
      ctx.fillRect(pos.x - width / 2, pos.y + height / 2, width, height * 0.6);

      ctx.fillStyle = '#2d3436';
      ctx.fillRect(pos.x - width / 2 - 4 * scale, pos.y - height / 2 - 25 * scale, 6 * scale, 30 * scale);
      ctx.fillRect(pos.x + width / 2 - 2 * scale, pos.y - height / 2 - 25 * scale, 6 * scale, 30 * scale);

      if (t > 0.3) {
        ctx.strokeStyle = '#b2bec3';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(pos.x - width / 2 - 1 * scale, pos.y - height / 2 - 25 * scale);
        ctx.lineTo(pos.x - width / 2 - 1 * scale, pos.y - height / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x + width / 2 - 1 * scale, pos.y - height / 2 - 25 * scale);
        ctx.lineTo(pos.x + width / 2 - 1 * scale, pos.y - height / 2);
        ctx.stroke();
      }
    }

    const startPos = project3D({ x: bridgeData.x - bridgeData.width / 2 + 10, y: bridgeData.y, z: bridgeData.z }, w, h);
    const endPos = project3D({ x: bridgeData.x + bridgeData.width / 2 - 10, y: bridgeData.y - 15, z: bridgeData.z + 50 }, w, h);

    const arrowGradient = ctx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
    arrowGradient.addColorStop(0, 'rgba(46, 213, 115, 0)');
    arrowGradient.addColorStop(0.5, 'rgba(46, 213, 115, 0.6)');
    arrowGradient.addColorStop(1, 'rgba(46, 213, 115, 0)');
    ctx.strokeStyle = arrowGradient;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y - 20);
    ctx.lineTo(endPos.x, endPos.y - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#2ed573';
    const arrowSize = 8;
    const angle = Math.atan2(endPos.y - 20 - (startPos.y - 20), endPos.x - startPos.x);
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y - 20 + endPos.y - 20) / 2;
    ctx.beginPath();
    ctx.moveTo(midX + Math.cos(angle) * arrowSize, midY + Math.sin(angle) * arrowSize);
    ctx.lineTo(midX + Math.cos(angle + 2.5) * arrowSize, midY + Math.sin(angle + 2.5) * arrowSize);
    ctx.lineTo(midX + Math.cos(angle - 2.5) * arrowSize, midY + Math.sin(angle - 2.5) * arrowSize);
    ctx.closePath();
    ctx.fill();
  }, [project3D]);

  const drawHole = useCallback((ctx: CanvasRenderingContext2D, holeData: typeof hole, w: number, h: number, time: number) => {
    const pos = project3D({ x: holeData.x, y: holeData.y, z: holeData.z }, w, h);
    const scale = pos.scale;
    const radius = holeData.radius * scale;

    const outerGlow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2);
    outerGlow.addColorStop(0, 'rgba(46, 213, 115, 0.4)');
    outerGlow.addColorStop(0.5, 'rgba(46, 213, 115, 0.2)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    const holeGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
    holeGradient.addColorStop(0, '#0a0a0a');
    holeGradient.addColorStop(0.7, '#1a1a1a');
    holeGradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = holeGradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2ed573';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    const pulse = Math.sin(time * 0.005) * 0.3 + 0.7;
    ctx.shadowColor = '#2ed573';
    ctx.shadowBlur = 15 * pulse;
    ctx.strokeStyle = `rgba(46, 213, 115, ${0.6 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const flagPos = { x: pos.x + radius * 0.3, y: pos.y - radius * 1.2 };
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(flagPos.x, flagPos.y, 3, radius * 1.4);
    
    const flagGradient = ctx.createLinearGradient(flagPos.x + 3, flagPos.y, flagPos.x + 35, flagPos.y);
    flagGradient.addColorStop(0, '#e74c3c');
    flagGradient.addColorStop(1, '#c0392b');
    ctx.fillStyle = flagGradient;
    ctx.beginPath();
    ctx.moveTo(flagPos.x + 3, flagPos.y);
    ctx.lineTo(flagPos.x + 35, flagPos.y + 10);
    ctx.lineTo(flagPos.x + 3, flagPos.y + 20);
    ctx.closePath();
    ctx.fill();
  }, [project3D]);

  const drawLauncher = useCallback((ctx: CanvasRenderingContext2D, launcherData: typeof launcher, w: number, h: number, time: number) => {
    const pos = project3D({ x: launcherData.x, y: launcherData.y, z: 0 }, w, h);
    const scale = pos.scale;
    const width = launcherData.width * scale;
    const height = launcherData.height * scale;

    const baseGradient = ctx.createLinearGradient(pos.x - width / 2, pos.y, pos.x + width / 2, pos.y);
    baseGradient.addColorStop(0, '#2d3436');
    baseGradient.addColorStop(0.5, '#636e72');
    baseGradient.addColorStop(1, '#2d3436');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);

    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x - width / 2, pos.y - height / 2, width, height);

    const chargeHeight = (launcherData.chargeProgress / launcherData.maxPower) * (height - 20);
    const chargeY = pos.y + height / 2 - 10 - chargeHeight;

    if (chargeHeight > 0) {
      const chargeGradient = ctx.createLinearGradient(pos.x, chargeY, pos.x, pos.y + height / 2 - 10);
      chargeGradient.addColorStop(0, '#00cec9');
      chargeGradient.addColorStop(0.5, '#74b9ff');
      chargeGradient.addColorStop(1, '#e17055');
      ctx.fillStyle = chargeGradient;
      ctx.fillRect(pos.x - width / 2 + 10, chargeY, width - 20, chargeHeight);
    }

    if (launcherData.isCharging) {
      const pulse = Math.sin(time * 0.02) * 0.3 + 0.7;
      ctx.shadowColor = '#00cec9';
      ctx.shadowBlur = 20 * pulse;
      ctx.strokeStyle = `rgba(0, 206, 201, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - width / 2 - 5, pos.y - height / 2 - 5, width + 10, height + 10);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = '#dfe6e9';
    ctx.font = `bold ${12 * scale}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('弹射器', pos.x, pos.y + height / 2 + 25 * scale);
    ctx.textAlign = 'left';
  }, [project3D]);

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: Ball, w: number, h: number, _time: number) => {
    const pos = project3D({ x: ball.x, y: ball.y, z: ball.z }, w, h);
    const scale = pos.scale;
    const radius = ball.radius * scale;

    const shadowY = pos.y + (ball.z + 100) * 0.3 * scale;
    const shadowGradient = ctx.createRadialGradient(pos.x, shadowY, 0, pos.x, shadowY, radius * 1.2);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    shadowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.ellipse(pos.x, shadowY, radius * 1.2, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    const ballGradient = ctx.createRadialGradient(
      pos.x - radius * 0.3,
      pos.y - radius * 0.3,
      0,
      pos.x,
      pos.y,
      radius
    );
    ballGradient.addColorStop(0, lightenColor(ball.color, 40));
    ballGradient.addColorStop(0.3, ball.color);
    ballGradient.addColorStop(0.7, darkenColor(ball.color, 20));
    ballGradient.addColorStop(1, darkenColor(ball.color, 40));

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    const highlightGradient = ctx.createRadialGradient(
      pos.x - radius * 0.3,
      pos.y - radius * 0.3,
      0,
      pos.x - radius * 0.3,
      pos.y - radius * 0.3,
      radius * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(pos.x - radius * 0.25, pos.y - radius * 0.25, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(ball.rotation);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.8, radius * 0.3, (i * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = withAlpha(ball.color, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project3D]);

  const drawExplosionParticle = useCallback((ctx: CanvasRenderingContext2D, p: ExplosionParticle) => {
    const opacity = p.opacity;
    const size = p.size * opacity;

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 1.5);
    gradient.addColorStop(0, withAlpha(p.color, opacity));
    gradient.addColorStop(0.5, withAlpha(lightenColor(p.color, 30), opacity * 0.7));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = withAlpha('#ffffff', opacity);
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawCelebrationParticle = useCallback((ctx: CanvasRenderingContext2D, p: CelebrationParticle) => {
    const opacity = p.opacity;
    const size = p.size * opacity;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    if (p.type === 'confetti') {
      ctx.fillStyle = withAlpha(p.color, opacity);
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
      
      ctx.fillStyle = withAlpha('#ffffff', opacity * 0.5);
      ctx.fillRect(-size / 2, -size / 4, size, size / 6);
    } else if (p.type === 'star') {
      ctx.fillStyle = withAlpha(p.color, opacity);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const outerX = Math.cos(angle) * size / 2;
        const outerY = Math.sin(angle) * size / 2;
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * size / 4;
        const innerY = Math.sin(innerAngle) * size / 4;
        if (i === 0) {
          ctx.moveTo(outerX, outerY);
        } else {
          ctx.lineTo(outerX, outerY);
        }
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = withAlpha('#ffffff', opacity * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
      gradient.addColorStop(0, withAlpha('#ffffff', opacity));
      gradient.addColorStop(0.3, withAlpha(p.color, opacity));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawHUD = useCallback((ctx: CanvasRenderingContext2D, w: number, scene: typeof sceneRef.current) => {
    const padding = 20;
    const barWidth = 200;

    const panelGradient = ctx.createLinearGradient(padding, padding, padding, padding + 100);
    panelGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    panelGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = panelGradient;
    ctx.beginPath();
    ctx.roundRect(padding, padding, barWidth + 20, 90, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.fillText('分数', padding + 12, padding + 25);
    ctx.font = 'bold 28px Outfit, sans-serif';
    const scoreGradient = ctx.createLinearGradient(padding + 12, 0, padding + 12 + 100, 0);
    scoreGradient.addColorStop(0, '#f093fb');
    scoreGradient.addColorStop(1, '#f5576c');
    ctx.fillStyle = scoreGradient;
    ctx.fillText(scene.score.toString(), padding + 12, padding + 58);

    if (scene.isCelebrating) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      const textGradient = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0);
      textGradient.addColorStop(0, '#f093fb');
      textGradient.addColorStop(0.5, '#4facfe');
      textGradient.addColorStop(1, '#43e97b');
      ctx.fillStyle = textGradient;
      ctx.font = 'bold 56px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#f093fb';
      ctx.shadowBlur = 30;
      ctx.fillText('🎉 进洞啦！ 🎉', w / 2, 120);
      ctx.font = 'bold 24px Outfit, sans-serif';
      ctx.fillText(`+100 分`, w / 2, 160);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
      ctx.restore();
    }
  }, []);

  const render = useCallback(
    (deltaTime: number, timestamp: number) => {
      const ctx = getContext();
      if (!ctx || width === 0 || height === 0) return;

      timeRef.current = timestamp;
      const scene = sceneRef.current;

      clear();
      drawBackground(ctx, width, height, timestamp);

      scene.curvedBoard.angle = lerp(
        scene.curvedBoard.angle,
        scene.curvedBoard.targetAngle,
        0.15
      );

      if (scene.launcher.isCharging) {
        scene.launcher.chargeProgress = Math.min(
          scene.launcher.maxPower,
          scene.launcher.chargeProgress + deltaTime * 60
        );
        updateLauncher({ chargeProgress: scene.launcher.chargeProgress });
      }

      if (scene.isCelebrating) {
        scene.celebrationTimer -= deltaTime * 60;
        if (scene.celebrationTimer <= 0) {
          setPinballCelebrating(false);
          scene.isCelebrating = false;
        }
        setPinballCelebrationTimer(scene.celebrationTimer);
      }

      for (let i = scene.balls.length - 1; i >= 0; i--) {
        let ball = { ...scene.balls[i] };
        if (!ball.isActive) continue;

        const holeDx = scene.hole.x - ball.x;
        const holeDy = scene.hole.y - ball.y;
        const holeDz = scene.hole.z - ball.z;
        const holeDistance = Math.sqrt(holeDx * holeDx + holeDy * holeDy + holeDz * holeDz);

        if (holeDistance < 180) {
          const attractStrength = (1 - holeDistance / 180) * 120;
          ball.vx += (holeDx / Math.max(holeDistance, 1)) * attractStrength * deltaTime;
          ball.vy += (holeDy / Math.max(holeDistance, 1)) * attractStrength * deltaTime;
          ball.vz += (holeDz / Math.max(holeDistance, 1)) * attractStrength * deltaTime;
        }

        ball.vy += gravityRef.current * deltaTime;
        ball.vz -= 50 * deltaTime;

        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;
        ball.z += ball.vz * deltaTime;
        ball.rotation += ball.vx * deltaTime * 0.01;

        ball.vx *= 0.995;
        ball.vy *= 0.995;
        ball.vz *= 0.98;

        if (ball.z < 0) {
          ball.z = 0;
          ball.vz *= -0.5;
        }

        if (ball.x < ball.radius) {
          ball.x = ball.radius;
          ball.vx *= -0.7;
        }
        if (ball.x > width - ball.radius) {
          ball.x = width - ball.radius;
          ball.vx *= -0.7;
        }
        if (ball.y > height - ball.radius) {
          ball.y = height - ball.radius;
          ball.vy *= -0.5;
          ball.vx *= 0.95;
        }
        if (ball.y < ball.radius) {
          ball.y = ball.radius;
          ball.vy *= -0.7;
        }

        ball = checkCollisionWithCurvedBoard(ball, scene.curvedBoard);
        ball = checkCollisionWithBridge(ball, scene.bridge);

        if (checkHoleCollision(ball, scene.hole)) {
          createCelebration(
            project3D({ x: ball.x, y: ball.y, z: ball.z }, width, height).x,
            project3D({ x: ball.x, y: ball.y, z: ball.z }, width, height).y
          );
          scene.score += 100;
          setPinballScore(scene.score);
          setPinballCelebrating(true);
          scene.isCelebrating = true;
          scene.celebrationTimer = 120;
          setPinballCelebrationTimer(120);
          ball.isActive = false;
          removePinballBall(ball.id);
          scene.balls.splice(i, 1);
          continue;
        }

        updatePinballBall(ball.id, {
          x: ball.x,
          y: ball.y,
          z: ball.z,
          vx: ball.vx,
          vy: ball.vy,
          vz: ball.vz,
          rotation: ball.rotation,
        });
        scene.balls[i] = ball;
      }

      for (let i = scene.explosionParticles.length - 1; i >= 0; i--) {
        const p = scene.explosionParticles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += gravityRef.current * 0.5 * deltaTime;
        p.vx *= 0.98;
        p.life -= deltaTime * 60;
        p.opacity = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          scene.explosionParticles.splice(i, 1);
        } else {
          drawExplosionParticle(ctx, p);
        }
      }

      for (let i = scene.celebrationParticles.length - 1; i >= 0; i--) {
        const p = scene.celebrationParticles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += gravityRef.current * 0.4 * deltaTime;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed * deltaTime;
        p.life -= deltaTime * 60;
        p.opacity = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          scene.celebrationParticles.splice(i, 1);
        } else {
          drawCelebrationParticle(ctx, p);
        }
      }

      drawBridge(ctx, scene.bridge, width, height);
      drawHole(ctx, scene.hole, width, height, timestamp);
      drawCurvedBoard(ctx, scene.curvedBoard, width, height);
      drawLauncher(ctx, scene.launcher, width, height, timestamp);

      const sortedBalls = [...scene.balls].sort((a, b) => a.z - b.z);
      for (const ball of sortedBalls) {
        if (ball.isActive) {
          drawBall(ctx, ball, width, height, timestamp);
        }
      }

      updateCurvedBoard({ angle: scene.curvedBoard.angle });

      drawHUD(ctx, width, scene);
    },
    [
      getContext,
      width,
      height,
      clear,
      drawBackground,
      drawCurvedBoard,
      drawBridge,
      drawHole,
      drawLauncher,
      drawBall,
      drawExplosionParticle,
      drawCelebrationParticle,
      drawHUD,
      checkCollisionWithCurvedBoard,
      checkCollisionWithBridge,
      checkHoleCollision,
      createCelebration,
      updateCurvedBoard,
      updateLauncher,
      updatePinballBall,
      removePinballBall,
      setPinballScore,
      setPinballCelebrating,
      setPinballCelebrationTimer,
      project3D,
    ]
  );

  useAnimationFrame(render, true);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      const normalizedX = (e.clientX - rect.left) / rect.width;
      const targetAngle = (normalizedX - 0.5) * 1.2;
      sceneRef.current.curvedBoard.targetAngle = targetAngle;
      updateCurvedBoard({ targetAngle });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isDown = true;

      sceneRef.current.launcher.isCharging = true;
      sceneRef.current.launcher.chargeProgress = 0;
      updateLauncher({ isCharging: true, chargeProgress: 0 });
      setCursorType('draw');
    }
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;

    if (sceneRef.current.launcher.isCharging) {
      launchBall();
      sceneRef.current.launcher.isCharging = false;
      sceneRef.current.launcher.chargeProgress = 0;
      updateLauncher({ isCharging: false, chargeProgress: 0 });
    }

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
            sceneRef.current.launcher.isCharging = true;
            sceneRef.current.launcher.chargeProgress = 0;
            updateLauncher({ isCharging: true, chargeProgress: 0 });
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            mouseRef.current.x = touch.clientX - rect.left;
            mouseRef.current.y = touch.clientY - rect.top;
            const normalizedX = (touch.clientX - rect.left) / rect.width;
            const targetAngle = (normalizedX - 0.5) * 1.2;
            sceneRef.current.curvedBoard.targetAngle = targetAngle;
            updateCurvedBoard({ targetAngle });
          }
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleMouseUp();
        }}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm pointer-events-none text-center">
        <div>按住鼠标蓄力，松开弹射小球 🎱</div>
        <div className="text-xs mt-1">移动鼠标控制弧形木板的转动方向</div>
      </div>
    </div>
  );
};
