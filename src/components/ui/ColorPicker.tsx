import React from 'react';
import { cn } from '@/lib/utils';
import { colorPalettes } from '@/utils/colors';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  palette?: keyof typeof colorPalettes;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className = '',
  palette = 'garden',
  label,
}) => {
  const colors = colorPalettes[palette];
  
  const defaultLabel = palette === 'fluid' ? '颜料颜色' : '花朵颜色';
  const displayLabel = label ?? defaultLabel;

  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-white/70 text-sm">{displayLabel}</span>
      <div className="flex gap-2 flex-wrap">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'w-10 h-10 rounded-full transition-all duration-300 hover:scale-110',
              value === color
                ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110 shadow-lg'
                : 'hover:shadow-md'
            )}
            style={{
              backgroundColor: color,
              boxShadow:
                value === color
                  ? `0 0 20px ${color}80`
                  : `0 4px 10px ${color}40`,
            }}
            aria-label={`选择颜色 ${color}`}
          />
        ))}
      </div>
    </div>
  );
};
