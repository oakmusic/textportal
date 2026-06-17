import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-tp-bg text-tp-primary p-4 md:p-8 selection:bg-tp-blue/30">
      <header className="w-full max-w-4xl flex items-center justify-center py-8 mb-4">
        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
          <div className="relative">
            <div className="absolute inset-0 blur-md bg-tp-blue/40 group-hover:bg-tp-blue/60 transition-colors rounded-full" />
            <Hexagon className="w-10 h-10 text-tp-blue relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase">
            TextPortal
          </h1>
        </Link>
      </header>
      
      <main className="flex-grow w-full max-w-2xl flex flex-col">
        {children}
      </main>

      <footer className="w-full text-center py-6 text-tp-secondary/60 text-sm mt-auto">
        &copy; {new Date().getFullYear()} TextPortal. Ephemeral texts.
      </footer>
    </div>
  );
}
