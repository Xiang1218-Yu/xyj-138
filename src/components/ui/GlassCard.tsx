import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  border?: boolean;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  blur = 12,
  border = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden transition-all duration-300',
        border && 'border border-white/20',
        glow && 'shadow-[0_0_30px_rgba(102,126,234,0.3)]',
        className
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
