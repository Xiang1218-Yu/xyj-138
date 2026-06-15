import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-purple-500/50 overflow-hidden';

  const variants = {
    primary:
      'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/20',
    secondary:
      'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20',
    ghost:
      'bg-transparent hover:bg-white/10 text-white/80 hover:text-white border-0',
    gradient:
      'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105',
    danger:
      'bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/40 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );
};
