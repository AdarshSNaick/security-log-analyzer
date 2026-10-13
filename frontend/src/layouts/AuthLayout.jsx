import { Outlet } from 'react-router-dom';
import {
  FiShield,
  FiAlertOctagon,
  FiPieChart,
  FiActivity,
  FiSearch
} from 'react-icons/fi';

export const AuthLayout = () => {
  const features = [
    {
      icon: FiAlertOctagon,
      title: 'Threat Detection',
      desc: 'Real-time AI-assisted anomaly identification & signature matching.'
    },
    {
      icon: FiSearch,
      title: 'Log Analysis',
      desc: 'Centralized ingestion & deep-packet inspection for .log, .txt, .csv.'
    },
    {
      icon: FiActivity,
      title: 'Real-Time Monitoring',
      desc: 'Live telemetry feeds with sub-second alert dispatch.'
    },
    {
      icon: FiPieChart,
      title: 'Security Reports',
      desc: 'Automated executive compliance & audit trail documentation.'
    }
  ];

  return (
    <div
      className="auth-layout container-fluid min-vh-100 p-0 d-flex flex-column flex-lg-row"
      style={{
        backgroundColor: 'var(--soc-bg-dark)'
      }}
    >
      {/* =====================================================
          LEFT CYBERSECURITY FEATURE PANEL
          This panel intentionally stays dark in both themes.
      ====================================================== */}
      <div
        className="auth-feature-panel col-lg-6 d-flex flex-column justify-content-between p-4 p-md-5 position-relative overflow-hidden"
      >
        <div className="position-relative z-1">

          {/* Brand */}
          <div className="d-flex align-items-center gap-3 mb-5">

            <div
              className="p-3 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                background: 'var(--soc-accent-gradient)',
                color: '#070b19'
              }}
            >
              <FiShield size={28} />
            </div>

            <div>
              <h4 className="fw-bold mb-0 auth-brand-title">
                SECURITY
                <span style={{ color: 'var(--soc-cyan)' }}>
                  LOG
                </span>{' '}
                ANALYZER
              </h4>

              <span className="small text-cyan font-monospace">
                ENTERPRISE SOC SUITE
              </span>
            </div>
          </div>

          {/* Main Introduction */}
          <div className="mb-5">

            <h2 className="display-6 fw-bold auth-feature-title mb-3">
              Advanced Cyber Security Operations Center
            </h2>

            <p
              className="lead fs-6 auth-feature-description"
              style={{ maxWidth: '520px' }}
            >
              Protecting enterprise infrastructure through high-throughput
              log ingestion, automated incident mitigation, and automated
              threat matrix analysis.
            </p>

          </div>

          {/* Feature Cards */}
          <div className="row g-4 mt-2">

            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="col-sm-6"
                >
                  <div className="auth-feature-card p-3 h-100">

                    <div className="d-flex align-items-center gap-3 mb-2">

                      <div
                        className="p-2 rounded text-cyan"
                        style={{
                          backgroundColor:
                            'rgba(0, 242, 254, 0.1)'
                        }}
                      >
                        <Icon size={20} />
                      </div>

                      <h6 className="fw-bold auth-feature-card-title mb-0">
                        {feature.title}
                      </h6>

                    </div>

                    <p className="small auth-feature-card-description mb-0">
                      {feature.desc}
                    </p>

                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="pt-5 position-relative z-1 auth-feature-footer">

          <div className="d-flex align-items-center justify-content-between small">

            <span>
              Security Log Analyzer v2.4.0
            </span>

            <span className="font-monospace text-cyan">
              SOC Status: Operational
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          RIGHT AUTH FORM SECTION
      ====================================================== */}
      <div
        className="auth-form-panel col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5"
      >
        <div
          className="w-100"
          style={{ maxWidth: '440px' }}
        >
          <Outlet />
        </div>
      </div>

    </div>
  );
};