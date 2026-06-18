import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center bg-tp-bg text-tp-primary p-4 md:p-8 selection:bg-tp-blue/30 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 bg-tp-surface/30 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/5 z-50">
        <button 
          onClick={() => setLanguage('es')}
          className={`text-sm font-bold tracking-wider px-2 py-1 rounded-full transition-colors ${language === 'es' ? 'bg-tp-blue/20 text-tp-blue' : 'text-tp-secondary/50 hover:text-tp-secondary'}`}
        >
          ES
        </button>
        <span className="text-tp-secondary/30">|</span>
        <button 
          onClick={() => setLanguage('en')}
          className={`text-sm font-bold tracking-wider px-2 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-tp-blue/20 text-tp-blue' : 'text-tp-secondary/50 hover:text-tp-secondary'}`}
        >
          EN
        </button>
      </div>

      <header className="w-full max-w-4xl flex items-center justify-center py-8 mb-4 mt-8 md:mt-0">
        <Link to="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
          <div className="relative">
            <div className="absolute inset-0 blur-md bg-tp-blue/40 group-hover:bg-tp-blue/60 transition-colors rounded-full" />
            <Hexagon className="w-10 h-10 text-tp-blue relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase">
            {t('app_title')}
          </h1>
        </Link>
      </header>
      
      <main className="flex-grow w-full max-w-2xl flex flex-col">
        {children}
      </main>

      <footer className="w-full text-center py-6 text-tp-secondary/60 text-sm mt-auto">
        &copy; {new Date().getFullYear()} {t('app_title')}. {t('app_subtitle')}
      </footer>
    </div>
  );
}
