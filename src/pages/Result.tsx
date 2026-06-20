import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Copy, CheckCircle2, Link2, Clock, File as FileIcon, Image as ImageIcon } from 'lucide-react';
import Button from '../components/Button';
import { copyToClipboard } from '../utils/clipboard';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultProps {
  code: string;
  url: string;
  file?: File;
}

export default function Result({ code, url, file }: ResultProps) {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [timeLeft, setTimeLeft] = useState(file ? 24 * 60 * 60 : 300); // 24 hours for file, 5 mins for text

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds > 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyCode = async () => {
    if (await copyToClipboard(code)) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    if (await copyToClipboard(url)) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-wider mb-2 text-tp-red">{t('result_title')}</h2>
        <div className="flex items-center justify-center gap-2 text-tp-secondary mt-4">
          <Clock className="w-4 h-4" />
          <span>{t('result_expires')} <span className="font-mono text-tp-primary">{formatTime(timeLeft)} {timeLeft > 3600 ? 'hrs' : ''}</span></span>
        </div>
      </div>
      
      <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-8 w-full border-tp-red/20 glow-red relative overflow-hidden">
        {timeLeft === 0 && (
          <div className="absolute inset-0 bg-tp-bg/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <span className="text-tp-red font-bold text-xl tracking-wider">{t('result_expired')}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <span className="text-tp-secondary text-sm tracking-widest uppercase">{t('result_code')}</span>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-mono font-bold tracking-widest text-tp-primary">{code}</span>
            <button 
              onClick={handleCopyCode}
              className="p-2 rounded-full hover:bg-white/10 text-tp-secondary hover:text-white transition-colors"
              title={t('result_copy_code')}
            >
              {copiedCode ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {file && (
          <div className="w-full flex flex-col items-center gap-4 bg-black/20 p-4 rounded-xl border border-tp-red/10">
            {isImage ? (
              <ImageIcon className="w-12 h-12 text-tp-red opacity-80" />
            ) : (
              <FileIcon className="w-12 h-12 text-tp-red opacity-80" />
            )}
            <div className="text-center w-full">
              <p className="text-tp-primary font-medium truncate w-full" title={file.name}>{file.name}</p>
              <p className="text-tp-secondary text-sm">{formatSize(file.size)}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-lg">
          <QRCode value={url} size={200} level="H" />
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button variant="secondary" fullWidth onClick={handleCopyUrl}>
            {copiedUrl ? (
              <><CheckCircle2 className="w-5 h-5 text-green-400" /> {t('result_copied_url')}</>
            ) : (
              <><Link2 className="w-5 h-5" /> {t('result_copy_url')}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
