import { useEffect, useState } from 'react';

interface ActiveCode {
  code: string;
  expiresAt: number;
  length: number;
}

interface ActiveCodesTableProps {
  codes: ActiveCode[];
}

function useCountdown(expiresAt: number) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, expiresAt - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const CountdownRow = ({ code }: { code: ActiveCode }) => {
  const timeString = useCountdown(code.expiresAt);
  return (
    <tr className="hover:bg-zinc-800/20 transition-colors">
      <td className="px-6 py-4 font-mono text-zinc-300">{code.code}</td>
      <td className="px-6 py-4">{new Date(code.expiresAt - 300000).toLocaleTimeString()}</td>
      <td className="px-6 py-4 font-mono text-indigo-400">{timeString}</td>
      <td className="px-6 py-4">{code.length} chars</td>
    </tr>
  );
};

export default function ActiveCodesTable({ codes }: ActiveCodesTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-medium text-zinc-300">Active Codes</h3>
        <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          {codes.length} Valid
        </span>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Created Time</th>
              <th className="px-6 py-4 font-medium">Expires In</th>
              <th className="px-6 py-4 font-medium">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {codes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No active codes</td>
              </tr>
            ) : (
              codes.map((code, i) => <CountdownRow key={i} code={code} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
