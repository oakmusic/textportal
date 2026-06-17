import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import Button from '../components/Button';

export default function Receive() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Clean code input
  useEffect(() => {
    const cleaned = code.replace(/[^A-Za-z2-9]/g, '');
    if (cleaned !== code) {
      setCode(cleaned);
    }
  }, [code]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      setError('Code must be 4 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // We don't fetch text yet, just navigate or fetch text here?
      // Actually, standard is to just go to /r/:code or fetch directly.
      // Let's go to /r/:code which handles fetching and displaying.
      navigate(`/r/${code}`);
    } catch (err: any) {
      setError(err.message || 'Failed to check code.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-wider mb-2 text-tp-blue">RECEIVE TEXT</h2>
        <p className="text-tp-secondary">Enter the 4-character code</p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 items-center">
        <input 
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={4}
          placeholder="XXXX"
          className="text-center text-5xl font-mono font-bold tracking-widest bg-transparent border-b-2 border-tp-blue/30 focus:border-tp-blue focus:outline-none w-48 pb-2 text-tp-primary placeholder:text-tp-secondary/20 transition-colors"
          autoFocus
        />
        
        {error && (
          <div className="text-tp-red text-center bg-tp-red/10 p-3 rounded-lg border border-tp-red/20 w-full">
            {error}
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={code.length !== 4 || loading} 
          fullWidth
          className="mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              RECEIVE
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
