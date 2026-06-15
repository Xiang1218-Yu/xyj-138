import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  showValue?: boolean;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = '',
  showValue = true,
  unit = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">{label}</span>
          {showValue && (
            <span className="text-white font-medium">
              {value}
              {unit}
            </span>
          )}
        </div>
      )}
      <div className="relative h-2">
        <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg shadow-purple-500/30 pointer-events-none transition-all duration-150"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
