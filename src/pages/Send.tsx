import { useState, FormEvent } from 'react';
import { Send as SendIcon, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import { sendText } from '../utils/api';
import Result from './Result';

export default function Send() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ code: string; url: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await sendText(text);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <Result code={result.code} url={result.url} />;
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold tracking-wider mb-2">SEND TEXT</h2>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <TextArea 
          rows={10}
          placeholder="Paste your text or URLs here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          currentLength={text.length}
          autoFocus
        />
        
        {error && (
          <div className="text-tp-red text-center bg-tp-red/10 p-3 rounded-lg border border-tp-red/20">
            {error}
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={!text.trim() || loading} 
          className="mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <SendIcon className="w-5 h-5" />
              SEND
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
