import { useState } from 'react';
import { Lock } from 'lucide-react';
import Button from '../../components/Button';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/.netlify/functions/admin-login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        onLoginSuccess();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Access</h1>
          <p className="mt-2 text-zinc-400">Restricted area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
