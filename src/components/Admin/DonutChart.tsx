import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DonutChartsProps {
  title: string;
  data: Record<string, number>;
  colors?: string[];
}

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b'];

export default function DonutChart({ title, data, colors = DEFAULT_COLORS }: DonutChartsProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md flex flex-col h-full">
        <h3 className="mb-6 font-medium text-zinc-300">{title}</h3>
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          No data yet
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-xl">
          <p className="mb-1 text-sm text-zinc-400">{payload[0].name}</p>
          <p className="font-bold text-white">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md flex flex-col h-full">
      <h3 className="mb-4 font-medium text-zinc-300">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
