import { useEffect } from 'react';
import { X, Github, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative glass-panel glow-blue rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-tp-bg/50">
          <div className="flex items-center gap-3 text-tp-primary">
            <Info className="w-6 h-6 text-tp-blue" />
            <h2 className="text-xl font-bold tracking-wider uppercase">{t('about_title')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-tp-secondary/60 hover:text-tp-primary transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-tp-secondary">
          
          {/* What is */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-tp-primary uppercase tracking-wide">{t('about_what_is')}</h3>
            <p className="leading-relaxed opacity-90">{t('about_what_is_text')}</p>
          </section>

          {/* Privacy */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-tp-primary uppercase tracking-wide">{t('about_privacy')}</h3>
            <ul className="list-disc list-outside ml-5 space-y-2 opacity-90">
              <li>{t('about_privacy_1')}</li>
              <li>{t('about_privacy_2')}</li>
              <li>{t('about_privacy_3')}</li>
              <li>{t('about_privacy_4')}</li>
              <li>{t('about_privacy_5')}</li>
            </ul>
          </section>

          {/* Security */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-tp-primary uppercase tracking-wide">{t('about_security')}</h3>
            <ul className="list-disc list-outside ml-5 space-y-2 opacity-90">
              <li>{t('about_security_1')}</li>
              <li>{t('about_security_2')}</li>
              <li>{t('about_security_3')}</li>
              <li>{t('about_security_4')}</li>
            </ul>
          </section>

          {/* Open Source */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-tp-primary uppercase tracking-wide">{t('about_opensource')}</h3>
            <p className="leading-relaxed opacity-90">{t('about_opensource_text')}</p>
            <a 
              href="https://github.com/oakmusic/textportal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-tp-surface/30 hover:bg-tp-surface/50 border border-white/10 text-tp-primary px-5 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Github className="w-5 h-5" />
              {t('about_opensource_button')}
            </a>
          </section>

          {/* Technologies */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-tp-primary uppercase tracking-wide">{t('about_tech')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm opacity-90">
              <div><span className="text-tp-primary font-medium">Frontend:</span> React + TypeScript</div>
              <div><span className="text-tp-primary font-medium">Backend:</span> Netlify Functions</div>
              <div><span className="text-tp-primary font-medium">Text Storage:</span> Upstash Redis</div>
              <div><span className="text-tp-primary font-medium">File Storage:</span> Cloudflare R2</div>
              <div><span className="text-tp-primary font-medium">Hosting:</span> Netlify</div>
              <div><span className="text-tp-primary font-medium">DNS:</span> Cloudflare</div>
            </div>
          </section>

          {/* Author */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-tp-primary uppercase tracking-wide">{t('about_author')}</h3>
            <p className="leading-relaxed opacity-90">{t('about_author_text')}</p>
          </section>

        </div>

        {/* Footer Summary */}
        <div className="bg-tp-surface/10 border-t border-white/5 p-4 md:p-6 bg-tp-bg/80">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-tp-secondary/80 font-medium">
            <span>{t('about_footer_1')}</span>
            <span className="hidden sm:inline text-tp-surface/40">•</span>
            <span>{t('about_footer_2')}</span>
            <span className="hidden sm:inline text-tp-surface/40">•</span>
            <span>{t('about_footer_3')}</span>
            <span className="hidden sm:inline text-tp-surface/40">•</span>
            <span>{t('about_footer_4')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
