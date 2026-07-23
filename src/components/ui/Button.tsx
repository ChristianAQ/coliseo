import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<string, string> = {
  primary:
    'bg-imperial-500 text-white hover:bg-imperial-600 active:bg-imperial-700 shadow-soft disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none',
  secondary:
    'bg-white text-stone-800 border border-stone-300 hover:border-imperial-300 hover:text-imperial-600 shadow-soft disabled:text-stone-300',
  ghost:
    'bg-transparent text-stone-600 hover:bg-stone-200/70 hover:text-stone-900 disabled:text-stone-300',
  gold: 'bg-laurel-400 text-imperial-900 hover:bg-laurel-500 shadow-soft font-semibold disabled:bg-stone-300 disabled:text-stone-500',
};

const sizes: Record<string, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-2xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
