import { useEffect, useState } from 'react';
import { Activity, ArrowRightLeft, Clock, ShieldCheck, LogOut, RefreshCw, BarChart2 } from 'lucide-react';
import StatCard from '../../components/Admin/StatCard';
import TrafficCharts from '../../components/Admin/TrafficCharts';
import DonutChart from '../../components/Admin/DonutChart';
import ActivityTable from '../../components/Admin/ActivityTable';
import ActiveCodesTable from '../../components/Admin/ActiveCodesTable';
import BlockedIpsTable from '../../components/Admin/BlockedIpsTable';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [overview, setOverview] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [traffic, setTraffic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resO, resA, resT] = await Promise.all([
        fetch('/.netlify/functions/admin-overview'),
        fetch('/.netlify/functions/admin-activity'),
        fetch('/.netlify/functions/admin-traffic')
      ]);

      if (resO.ok && resA.ok && resT.ok) {
        setOverview(await resO.json());
        setActivity(await resA.json());
        setTraffic(await resT.json());
      } else if (resO.status === 401) {
        onLogout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch('/.netlify/functions/admin-logout', { method: 'POST' });
    onLogout();
  };

  if (!overview || !activity || !traffic) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" size={32} />
              Admin Dashboard
            </h1>
            <p className="mt-2 text-zinc-400">System overview and analytics.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Active Codes" value={overview.activeCodes} description="Currently valid" icon={<Activity />} />
          <StatCard title="Total Transfers" value={overview.totalTransfers} description="Since deployment" icon={<ArrowRightLeft />} />
          <StatCard title="Success Rate" value={`${overview.successRate}%`} description="Messages retrieved" icon={<BarChart2 />} />
          <StatCard title="Avg Transfer Time" value={`${overview.avgTransferTime}s`} description="Creation to retrieval" icon={<Clock />} />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-zinc-200">Traffic Analysis</h2>
          <TrafficCharts data24h={traffic.last24h} data30d={traffic.last30d} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <DonutChart title="Device Analytics" data={activity.devices} colors={['#6366f1', '#14b8a6', '#ec4899']} />
          <DonutChart title="Browser Analytics" data={activity.browsers} colors={['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#64748b']} />
          <DonutChart title="OS Analytics" data={activity.os} />
          <DonutChart title="Transfer Flow" data={activity.flows} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActiveCodesTable codes={activity.activeCodes} />
          </div>
          <div className="space-y-6">
             <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
                <h3 className="mb-4 font-medium text-zinc-300">Message Statistics</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex justify-between"><span>Total Sent</span><span className="text-white font-mono">{activity.messageStats.totalSent}</span></div>
                  <div className="flex justify-between"><span>Total Retrieved</span><span className="text-white font-mono">{activity.messageStats.totalRetrieved}</span></div>
                  <div className="flex justify-between"><span>Total Expired</span><span className="text-white font-mono">{activity.messageStats.totalExpired}</span></div>
                  <div className="flex justify-between"><span>Total Active</span><span className="text-white font-mono">{activity.messageStats.totalActive}</span></div>
                </div>
             </div>
             
             <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
                <h3 className="mb-4 font-medium text-zinc-300">Character Statistics</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex justify-between"><span>Total Transferred</span><span className="text-white font-mono">{activity.characterStats.totalCharacters}</span></div>
                  <div className="flex justify-between"><span>Avg Length</span><span className="text-white font-mono">{activity.characterStats.avgMessageLength}</span></div>
                  <div className="flex justify-between"><span>Largest Message</span><span className="text-white font-mono">{activity.characterStats.largestMessage}</span></div>
                </div>
             </div>

             <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
                <h3 className="mb-4 font-medium text-zinc-300">Performance</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex justify-between"><span>Fastest Retrieval</span><span className="text-emerald-400 font-mono">{(activity.performance.fastest / 1000).toFixed(2)}s</span></div>
                  <div className="flex justify-between"><span>Slowest Retrieval</span><span className="text-rose-400 font-mono">{(activity.performance.slowest / 1000).toFixed(2)}s</span></div>
                </div>
             </div>

             <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
                <h3 className="mb-4 font-medium text-zinc-300">File Statistics</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex justify-between"><span>Total Uploaded</span><span className="text-white font-mono">{activity.fileStats?.totalUploaded || 0}</span></div>
                  <div className="flex justify-between"><span>Total Downloaded</span><span className="text-white font-mono">{activity.fileStats?.totalDownloaded || 0}</span></div>
                  <div className="flex justify-between"><span>Total Active</span><span className="text-white font-mono">{activity.fileStats?.totalActive || 0}</span></div>
                  <div className="flex justify-between"><span>Total Size Uploaded</span><span className="text-white font-mono">{activity.fileStats?.totalSizeUploaded || '0 B'}</span></div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActivityTable events={activity.recentActivity} />
          <BlockedIpsTable ips={activity.blockedIps} />
        </div>
      </div>
    </div>
  );
}
