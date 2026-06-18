import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: ReactNode;
}

export default function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-white">{value}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}
