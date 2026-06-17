import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-6 py-3 rounded-xl font-semibold tracking-wider uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2",
          fullWidth && "w-full",
          variant === 'primary' && "bg-tp-blue text-tp-bg hover:bg-tp-blue/90 hover:glow-blue",
          variant === 'danger' && "bg-tp-red text-tp-bg hover:bg-tp-red/90 hover:glow-red",
          variant === 'secondary' && "bg-tp-surface border border-white/10 hover:border-white/30 text-tp-primary",
          variant === 'ghost' && "bg-transparent hover:bg-tp-surface text-tp-secondary hover:text-tp-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
