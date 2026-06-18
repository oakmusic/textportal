function formatDistanceToNow(timestamp: number) {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

interface ActivityEvent {
  timestamp: number;
  code: string;
  type: 'Created' | 'Retrieved' | 'Expired' | 'Blocked';
}

interface ActivityTableProps {
  events: ActivityEvent[];
}

export default function ActivityTable({ events }: ActivityTableProps) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Created': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Retrieved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Expired': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Blocked': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="font-medium text-zinc-300">Recent Activity</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Code / IP</th>
              <th className="px-6 py-4 font-medium">Event</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {events.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No recent activity</td>
              </tr>
            ) : (
              events.map((event, i) => (
                <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDistanceToNow(event.timestamp)} ago
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300">
                    {event.code}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
