import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const SuspiciousIPChart = ({ data }) => {
  const chartData = data || [
    { ip: "185.220.101.44", count: 342 },
    { ip: "103.21.244.0", count: 289 },
    { ip: "198.51.100.77", count: 195 },
    { ip: "45.33.32.156", count: 140 },
    { ip: "192.168.1.105", count: 85 }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
          <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="ip" stroke="#94a3b8" tick={{ fontSize: 11 }} width={100} />
          <Tooltip
            contentStyle={{ backgroundColor: '#090e24', borderColor: '#4facfe', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="count" fill="#4facfe" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
