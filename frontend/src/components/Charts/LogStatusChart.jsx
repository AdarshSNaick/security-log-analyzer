import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const LogStatusChart = ({ successCount = 11200, failedCount = 1250 }) => {
  const data = [
    { name: 'Successful Logins', value: successCount, color: '#00e676' },
    { name: 'Failed Logins', value: failedCount, color: '#ff3b5c' }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#090e24', borderColor: '#00f2fe', borderRadius: '8px', color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
