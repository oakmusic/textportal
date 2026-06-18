import { useEffect, useState } from 'react';

interface BlockedIp {
  ip: string;
  remainingSeconds: number;
}

interface BlockedIpsTableProps {
  ips: BlockedIp[];
}

function useCountdownSeconds(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const CountdownRow = ({ data }: { data: BlockedIp }) => {
  const timeString = useCountdownSeconds(data.remainingSeconds);
  return (
    <tr className="hover:bg-zinc-800/20 transition-colors">
      <td className="px-6 py-4 font-mono text-zinc-300">{data.ip}</td>
      <td className="px-6 py-4 font-mono text-rose-400">{timeString}</td>
    </tr>
  );
};

export default function BlockedIpsTable({ ips }: BlockedIpsTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-medium text-zinc-300">Blocked IPs</h3>
        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
          {ips.length} Blocked
        </span>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">IP Address</th>
              <th className="px-6 py-4 font-medium">Remaining Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {ips.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-zinc-500">No blocked IPs</td>
              </tr>
            ) : (
              ips.map((ip, i) => <CountdownRow key={i} data={ip} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
