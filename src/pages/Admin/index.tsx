import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/.netlify/functions/admin-check');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authorized);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}
