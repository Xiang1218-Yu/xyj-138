import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { lerp } from '@/utils/math';

export const CustomCursor: React.FC = () => {
  const { cursorType, isTransitioning } = useAppStore();
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [dotPosition, setDotPosition] = useState({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      setDotPosition((prev) => ({
        x: lerp(prev.x, targetRef.current.x, 0.3),
        y: lerp(prev.y, targetRef.current.y, 0.3),
      }));
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const getCursorSize = () => {
    switch (cursorType) {
      case 'hover':
        return 50;
      case 'draw':
        return 60;
      default:
        return 36;
    }
  };

  const getCursorColor = () => {
    switch (cursorType) {
      case 'hover':
        return 'rgba(102, 126, 234, 0.3)';
      case 'draw':
        return 'rgba(240, 147, 251, 0.3)';
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const getBorderColor = () => {
    switch (cursorType) {
      case 'hover':
        return 'rgba(102, 126, 234, 0.8)';
      case 'draw':
        return 'rgba(240, 147, 251, 0.8)';
      default:
        return 'rgba(255, 255, 255, 0.5)';
    }
  };

  if (isTransitioning) return null;

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] rounded-full transition-all duration-300 ease-out"
        style={{
          left: dotPosition.x,
          top: dotPosition.y,
          width: getCursorSize(),
          height: getCursorSize(),
          transform: 'translate(-50%, -50%)',
          backgroundColor: getCursorColor(),
          border: `2px solid ${getBorderColor()}`,
          boxShadow: cursorType !== 'default' 
            ? `0 0 30px ${getBorderColor()}` 
            : 'none',
        }}
      />
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] w-2 h-2 bg-white rounded-full"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
        }}
      />
    </>
  );
};
