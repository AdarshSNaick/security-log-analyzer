import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ThreatSeverityChart = ({ data }) => {
  const chartData = data || [
    { name: 'Critical', count: 14, color: '#ff3b5c' },
    { name: 'High', count: 38, color: '#ff8c00' },
    { name: 'Medium', count: 120, color: '#ffd166' },
    { name: 'Low', count: 310, color: '#00f2fe' }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#090e24', borderColor: '#00f2fe', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
