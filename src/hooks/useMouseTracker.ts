import { useEffect, useRef, useState, useCallback } from 'react';

interface MouseState {
  x: number;
  y: number;
  isDown: boolean;
  velocityX: number;
  velocityY: number;
  speed: number;
}

export const useMouseTracker = (
  targetRef?: React.RefObject<HTMLElement>,
  onMouseMove?: (state: MouseState) => void,
  onMouseDown?: (state: MouseState) => void,
  onMouseUp?: (state: MouseState) => void
) => {
  const [mouseState, setMouseState] = useState<MouseState>({
    x: 0,
    y: 0,
    isDown: false,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
  });

  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);

  const updateState = useCallback(
    (updates: Partial<MouseState>) => {
      setMouseState((prev) => {
        const newState = { ...prev, ...updates };
        return newState;
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const target = targetRef?.current || window;
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect =
        target instanceof HTMLElement
          ? target.getBoundingClientRect()
          : { left: 0, top: 0 };

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const now = performance.now();
      const deltaTime = Math.max((now - lastTimeRef.current) / 1000, 0.001);

      const velocityX = (x - lastPosRef.current.x) / deltaTime;
      const velocityY = (y - lastPosRef.current.y) / deltaTime;
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

      lastPosRef.current = { x, y };
      lastTimeRef.current = now;

      const newState = {
        x,
        y,
        velocityX,
        velocityY,
        speed,
        isDown: mouseState.isDown,
      };

      updateState(newState);
      onMouseMove?.(newState);
    },
    [targetRef, mouseState.isDown, onMouseMove, updateState]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const target = targetRef?.current || window;
      const rect =
        target instanceof HTMLElement
          ? target.getBoundingClientRect()
          : { left: 0, top: 0 };

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      lastPosRef.current = { x, y };
      lastTimeRef.current = performance.now();

      const newState = {
        x,
        y,
        velocityX: 0,
        velocityY: 0,
        speed: 0,
        isDown: true,
      };

      updateState({ isDown: true });
      onMouseDown?.(newState);
    },
    [targetRef, onMouseDown, updateState]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent | TouchEvent) => {
      let clientX: number, clientY: number;

      if ('changedTouches' in e) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const target = targetRef?.current || window;
      const rect =
        target instanceof HTMLElement
          ? target.getBoundingClientRect()
          : { left: 0, top: 0 };

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const newState = {
        x,
        y,
        velocityX: 0,
        velocityY: 0,
        speed: 0,
        isDown: false,
      };

      updateState({ isDown: false });
      onMouseUp?.(newState);
    },
    [targetRef, onMouseUp, updateState]
  );

  useEffect(() => {
    const target = targetRef?.current || window;

    target.addEventListener('mousemove', handleMouseMove as EventListener);
    target.addEventListener('mousedown', handleMouseDown as EventListener);
    window.addEventListener('mouseup', handleMouseUp as EventListener);

    target.addEventListener('touchmove', handleMouseMove as EventListener, { passive: false });
    target.addEventListener('touchstart', handleMouseDown as EventListener, { passive: false });
    window.addEventListener('touchend', handleMouseUp as EventListener);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
      target.removeEventListener('mousedown', handleMouseDown as EventListener);
      window.removeEventListener('mouseup', handleMouseUp as EventListener);

      target.removeEventListener('touchmove', handleMouseMove as EventListener);
      target.removeEventListener('touchstart', handleMouseDown as EventListener);
      window.removeEventListener('touchend', handleMouseUp as EventListener);
    };
  }, [targetRef, handleMouseMove, handleMouseDown, handleMouseUp]);

  return mouseState;
};
