export const Loader = ({ text = 'Scanning SOC Telemetry Data...', fullPage = false }) => {
  const loaderContent = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className="radar-spinner mb-3"></div>
      <p className="small text-cyan mb-0 tracking-wider text-uppercase font-monospace">{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: 'var(--soc-bg-dark)', zIndex: 9999 }}
      >
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
