import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrafficChartsProps {
  data24h: any[];
  data30d: any[];
}

export default function TrafficCharts({ data24h, data30d }: TrafficChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-xl">
          <p className="mb-1 text-sm text-zinc-400">{label}</p>
          <p className="font-bold text-indigo-400">{payload[0].value} transfers</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
        <h3 className="mb-6 font-medium text-zinc-300">Last 24 Hours</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data24h} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} content={<CustomTooltip />} />
              <Bar dataKey="transfers" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md">
        <h3 className="mb-6 font-medium text-zinc-300">Last 30 Days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data30d} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} content={<CustomTooltip />} />
              <Bar dataKey="transfers" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
