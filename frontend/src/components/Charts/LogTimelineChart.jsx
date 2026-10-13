import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const LogTimelineChart = ({ data }) => {
  const chartData = data || [
    { time: "00:00", logs: 4200, threats: 12 },
    { time: "04:00", logs: 2100, threats: 5 },
    { time: "08:00", logs: 8900, threats: 45 },
    { time: "12:00", logs: 15400, threats: 88 },
    { time: "16:00", logs: 18900, threats: 104 },
    { time: "20:00", logs: 12450, threats: 62 }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="logColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="threatColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#090e24', borderColor: '#00f2fe', borderRadius: '8px', color: '#fff' }}
          />
          <Area type="monotone" dataKey="logs" name="Log Activity" stroke="#00f2fe" fillOpacity={1} fill="url(#logColor)" />
          <Area type="monotone" dataKey="threats" name="Threat Events" stroke="#ff3b5c" fillOpacity={1} fill="url(#threatColor)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
