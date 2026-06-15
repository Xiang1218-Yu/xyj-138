import { useRef, useEffect, useCallback, useState } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export const useCanvas = (
  onResize?: (width: number, height: number) => void,
  devicePixelRatio: number = window.devicePixelRatio || 1
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const dprRef = useRef(devicePixelRatio);

  const getContext = useCallback(
    (contextType: '2d' = '2d'): CanvasRenderingContext2D | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.getContext(contextType);
    },
    []
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = dprRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    setSize({ width, height });
    onResize?.(width, height);
  }, [onResize]);

  useEffect(() => {
    resize();

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resize]);

  const clear = useCallback(() => {
    const ctx = getContext();
    if (!ctx || !canvasRef.current) return;

    const { width, height } = size;
    ctx.clearRect(0, 0, width, height);
  }, [getContext, size]);

  const fill = useCallback(
    (style: string) => {
      const ctx = getContext();
      if (!ctx || !canvasRef.current) return;

      const { width, height } = size;
      ctx.fillStyle = style;
      ctx.fillRect(0, 0, width, height);
    },
    [getContext, size]
  );

  return {
    canvasRef,
    getContext,
    clear,
    fill,
    width: size.width,
    height: size.height,
  };
};
