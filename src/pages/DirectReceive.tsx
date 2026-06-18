import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import { receiveText } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { useLanguage } from '../contexts/LanguageContext';

export default function DirectReceive() {
  const { t } = useLanguage();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const fetchText = async () => {
      try {
        const data = await receiveText(code);
        setText(data.text);
        
        // Try auto-copying
        const success = await copyToClipboard(data.text);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } else {
          setCopyError(true);
        }
      } catch (err: any) {
        setError(err.message || t('dreceive_error_message'));
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [code, navigate, t]);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 3000);
    } else {
      setCopyError(true);
    }
  };

  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 flex-grow h-64 animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin text-tp-blue" />
        <p className="text-tp-secondary tracking-widest">{t('dreceive_loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 flex-grow max-w-md mx-auto w-full">
        <div className="glass-panel p-8 rounded-3xl w-full text-center border-tp-red/20 glow-red">
          <h2 className="text-xl font-bold text-tp-red mb-4 uppercase">{t('dreceive_error_title')}</h2>
          <p className="text-tp-primary">{error}</p>
        </div>
        <Button onClick={() => navigate('/receive')} fullWidth variant="secondary">
          {t('dreceive_error_button')}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-wider text-tp-blue">{t('dreceive_title')}</h2>
          {copyError && (
            <span className="text-tp-red flex items-center gap-1 text-sm font-semibold tracking-wider">
              {t('dreceive_copy_error')}
            </span>
          )}
        </div>

        <Button variant="primary" onClick={handleCopy} className="py-2 px-4 text-sm h-10">
          {copied ? (
            <><CheckCircle2 className="w-4 h-4" /> {t('dreceive_copied')}</>
          ) : (
            <><Copy className="w-4 h-4" /> {t('dreceive_copy_text')}</>
          )}
        </Button>
      </div>

      <TextArea 
        rows={12}
        value={text}
        readOnly
        className="cursor-text"
      />

      {isUrl(text.trim()) && (
        <div className="flex justify-end">
          <Button 
            variant="secondary"
            onClick={() => window.open(text.trim(), '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="w-5 h-5" /> {t('dreceive_open_link')}
          </Button>
        </div>
      )}
    </div>
  );
}
