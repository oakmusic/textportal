import { useState, useEffect, useRef } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function InstallModal() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if already in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Already installed, do not show popup
    }

    // Capture install prompt event if supported (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Wait 200ms after mount to smoothly present popup
    const entranceTimeout = setTimeout(() => {
      setIsVisible(true);
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 3000);
    }, 200);

    return () => {
      clearTimeout(entranceTimeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const pauseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 400);
  };

  const handleInstallClick = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsVisible(false);
      } else {
        handleClose();
      }
      setDeferredPrompt(null);
    } else {
      // Check if iOS
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIos) {
        setShowIosGuide(true);
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        // Fallback for browsers that don't expose beforeinstallprompt yet
        handleClose();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      onMouseEnter={pauseTimer}
      onTouchStart={pauseTimer}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md transition-all duration-400 ease-out transform ${
        isClosing ? '-translate-y-12 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#171A21]/95 backdrop-blur-xl border border-tp-blue/40 shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-4 flex flex-col gap-3">
        {/* Animated 3-second progress timer bar */}
        {!showIosGuide && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tp-blue to-tp-red"
              style={{
                animation: 'shrink-timer 3s linear forwards',
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tp-blue/15 border border-tp-blue/30 flex items-center justify-center text-tp-blue shrink-0 shadow-[0_0_12px_rgba(77,166,255,0.3)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm text-tp-primary tracking-wide">
                {t('install_title')}
              </span>
              <span className="text-xs text-tp-secondary/80 line-clamp-1">
                {t('install_desc')}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-tp-secondary hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIosGuide ? (
          <div className="flex items-center gap-2 text-xs bg-tp-blue/10 border border-tp-blue/20 rounded-lg p-2 text-tp-blue">
            <Share className="w-4 h-4 shrink-0" />
            <span>{t('install_ios_guide')}</span>
          </div>
        ) : (
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-tp-blue to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_4px_15px_rgba(77,166,255,0.35)] hover:shadow-[0_4px_20px_rgba(77,166,255,0.5)] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              {t('install_button')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink-timer {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
