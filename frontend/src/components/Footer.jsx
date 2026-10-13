export const Footer = () => {
  return (
    <footer
      className="py-3 px-4 border-top mt-auto text-muted small"
      style={{
        backgroundColor: 'var(--soc-bg-navbar)',
        borderColor: 'var(--soc-border-color)'
      }}
    >
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-3">
          <span className="fw-semibold text-bright">Security Log Analyzer v2.4.0-SOC</span>
          <span>•</span>
          <span className="font-monospace text-cyan">API Gateway: Online (14ms)</span>
        </div>
        <div>
          <span>© 2026 Security Operations Center. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
};
