import { Link } from 'react-router-dom';
import { FiShieldOff, FiHome } from 'react-icons/fi';
import { Button } from '../components/Buttons/Button';

export const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 text-center" style={{ backgroundColor: 'var(--soc-bg-dark)' }}>
      <div className="soc-card p-5 border-danger" style={{ maxWidth: '500px' }}>
        <div className="d-inline-flex p-4 rounded-circle bg-dark text-danger mb-4 border border-danger">
          <FiShieldOff size={48} />
        </div>
        <h1 className="display-4 fw-extrabold text-bright mb-2">404</h1>
        <h4 className="fw-bold text-danger mb-3">Security Clearance Denied / Page Not Found</h4>
        <p className="small text-muted mb-4">
          The requested endpoint or resource does not exist within the SOC Security Log Analyzer routing table.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" icon={FiHome} className="w-100">
            Return to SOC Command Center
          </Button>
        </Link>
      </div>
    </div>
  );
};
