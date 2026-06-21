import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Loader2, CheckCircle2, Download, File } from 'lucide-react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import { receiveText } from '../utils/api';
import { copyToClipboard, copyImageToClipboard } from '../utils/clipboard';
import { useLanguage } from '../contexts/LanguageContext';

export default function DirectReceive() {
  const { t } = useLanguage();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const result = await receiveText(code);
        setData(result);
        
        if (result.type === 'text') {
          // Try auto-copying
          const success = await copyToClipboard(result.text);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
          } else {
            setCopyError(true);
          }
        }
      } catch (err: any) {
        setError(err.message || t('dreceive_error_message'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, navigate, t]);

  const handleCopy = async () => {
    if (data?.type === 'text') {
      const success = await copyToClipboard(data.text);
      if (success) {
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 3000);
      } else {
        setCopyError(true);
      }
    }
  };

  const handleCopyImage = async () => {
    if (data?.type === 'file' && data.file.mimeType.startsWith('image/')) {
      const success = await copyImageToClipboard(data.file.downloadUrl);
      if (success) {
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 3000);
      } else {
        setCopyError(true);
      }
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (data?.type === 'file') {
    const file = data.file;
    const isImage = file.mimeType.startsWith('image/');
    
    return (
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl font-bold tracking-wider text-tp-blue">{t('dreceive_file_title')}</h2>
        </div>

        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-6 w-full border-tp-blue/30 glow-blue">
          {isImage ? (
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/20 border border-tp-blue/20 flex items-center justify-center mb-4">
              <img src={file.previewUrl} alt={file.filename} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-tp-blue/10 flex items-center justify-center mb-4 border border-tp-blue/20">
              <File className="w-16 h-16 text-tp-blue" />
            </div>
          )}

          <div className="flex flex-col items-center gap-1 w-full text-center">
            <span className="text-xl text-tp-primary font-medium truncate w-full" title={file.filename}>{file.filename}</span>
            <span className="text-tp-secondary tracking-wider">{formatSize(file.size)}</span>
          </div>

          <div className="w-full flex flex-col items-center gap-2 mt-4">
            <div className="w-full flex gap-3">
              {isImage && (
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={handleCopyImage}
                >
                  {copied ? (
                    <><CheckCircle2 className="w-5 h-5" /> {t('dreceive_copied')}</>
                  ) : (
                    <><Copy className="w-5 h-5" /> {t('dreceive_copy_image')}</>
                  )}
                </Button>
              )}
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => window.open(file.downloadUrl, '_blank')}
              >
                <Download className="w-5 h-5" /> {t('dreceive_download')}
              </Button>
            </div>
            {copyError && isImage && (
              <span className="text-tp-red text-sm font-semibold tracking-wider text-center mt-1">
                {t('dreceive_copy_error')}
              </span>
            )}
          </div>
        </div>
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
        value={data?.text || ''}
        readOnly
        className="cursor-text"
      />

      {data?.text && isUrl(data.text.trim()) && (
        <div className="flex justify-end">
          <Button 
            variant="secondary"
            onClick={() => window.open(data.text.trim(), '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="w-5 h-5" /> {t('dreceive_open_link')}
          </Button>
        </div>
      )}
    </div>
  );
}
