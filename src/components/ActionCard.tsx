import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ActionCardProps {
  to: string;
  icon: ReactNode;
  label: string;
  variant: 'send' | 'receive';
}

export default function ActionCard({ to, icon, label, variant }: ActionCardProps) {
  return (
    <Link 
      to={to} 
      className={cn(
        "glass-panel rounded-3xl p-8 flex flex-col items-center justify-center gap-6 transition-all duration-300",
        "hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]",
        variant === 'send' 
          ? "hover:border-tp-red/50 hover:glow-red" 
          : "hover:border-tp-blue/50 hover:glow-blue"
      )}
    >
      <div className={cn(
        "flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
        variant === 'send' ? "text-tp-red" : "text-tp-blue"
      )}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold tracking-widest">{label}</h2>
    </Link>
  );
}
