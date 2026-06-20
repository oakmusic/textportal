import { useState, FormEvent } from 'react';
import { Send as SendIcon, Loader2, Type, File as FileIcon } from 'lucide-react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import FileUploader from '../components/FileUploader';
import { sendText, uploadFile } from '../utils/api';
import Result from './Result';
import { useLanguage } from '../contexts/LanguageContext';

export default function Send() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ code: string; url: string; file?: File } | null>(null);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (activeTab === 'text' && !text.trim()) return;
    if (activeTab === 'file' && !file) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'text') {
        const data = await sendText(text);
        setResult(data);
      } else {
        const data = await uploadFile(file!);
        setResult({ ...data, file: file! });
      }
    } catch (err: any) {
      setError(err.message || t('send_error'));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <Result code={result.code} url={result.url} file={result.file} />;
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold tracking-wider mb-2">{t('send_title')}</h2>
      
      <div className="flex bg-black/20 p-1 rounded-xl w-full border border-tp-blue/20">
        <button
          onClick={() => { setActiveTab('text'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
            activeTab === 'text' ? 'bg-tp-blue/20 text-tp-blue font-semibold' : 'text-tp-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-4 h-4" /> Text
        </button>
        <button
          onClick={() => { setActiveTab('file'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
            activeTab === 'file' ? 'bg-tp-blue/20 text-tp-blue font-semibold' : 'text-tp-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <FileIcon className="w-4 h-4" /> Files
        </button>
      </div>

      <div className="w-full flex flex-col gap-6">
        {activeTab === 'text' ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <TextArea 
              rows={10}
              placeholder={t('send_placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={20000}
              currentLength={text.length}
              autoFocus
            />
          </form>
        ) : (
          <div className="w-full">
            <FileUploader onFileSelect={setFile} disabled={loading} />
          </div>
        )}
        
        {error && (
          <div className="text-tp-red text-center bg-tp-red/10 p-3 rounded-lg border border-tp-red/20">
            {error}
          </div>
        )}
        
        <Button 
          type="button" 
          onClick={() => handleSubmit()}
          disabled={(activeTab === 'text' ? !text.trim() : !file) || loading} 
          className="mt-4 w-full"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <SendIcon className="w-5 h-5" />
              {activeTab === 'file' ? t('send_file_button') : t('send_button')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
