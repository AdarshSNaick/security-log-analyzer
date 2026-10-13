import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'cyan' }) => {
  return (
    <div className="soc-card p-4 h-100 position-relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div
        className="position-absolute end-0 top-0 rounded-circle"
        style={{
          width: '100px',
          height: '100px',
          background: `var(--soc-${color})`,
          filter: 'blur(60px)',
          opacity: 0.12,
          marginRight: '-30px',
          marginTop: '-30px'
        }}
      ></div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="small text-muted text-uppercase fw-bold font-monospace" style={{ letterSpacing: '0.8px', fontSize: '0.75rem' }}>
          {title}
        </span>
        {Icon && (
          <div
            className="p-2 rounded-3 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: `rgba(0, 242, 254, 0.1)`,
              color: `var(--soc-${color})`,
              boxShadow: `0 0 12px rgba(0, 242, 254, 0.2)`
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="d-flex align-items-baseline justify-content-between">
        <h3 className="fw-bold text-bright mb-0 font-monospace">{value?.toLocaleString()}</h3>
        {trendValue && (
          <span
            className={`small fw-bold font-monospace d-flex align-items-center gap-1 px-2 py-1 rounded-pill ${
              trend === 'up' ? 'bg-danger-subtle text-danger border border-danger' : 'bg-success-subtle text-success border border-success'
            }`}
            style={{ fontSize: '0.72rem' }}
          >
            {trend === 'up' ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};
