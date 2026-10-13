export const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div className="soc-card p-4 h-100 d-flex flex-column">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="fw-bold text-bright mb-1">{title}</h5>
          {subtitle && <p className="small text-muted mb-0">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-grow-1 d-flex align-items-center justify-content-center w-100 min-vh-25">
        {children}
      </div>
    </div>
  );
};
