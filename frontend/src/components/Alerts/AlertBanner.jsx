import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

export const AlertBanner = ({ type = 'info', message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
      case 'error':
        return <FiXCircle className="text-danger flex-shrink-0" size={20} />;
      case 'success':
        return <FiCheckCircle className="text-success flex-shrink-0" size={20} />;
      case 'warning':
        return <FiAlertCircle className="text-warning flex-shrink-0" size={20} />;
      default:
        return <FiInfo className="text-cyan flex-shrink-0" size={20} />;
    }
  };

  return (
    <div className={`alert alert-${type === 'error' ? 'danger' : type} soc-card border-${type} d-flex align-items-center justify-content-between p-3 mb-4`}>
      <div className="d-flex align-items-center gap-3">
        {getIcon()}
        <span className="small text-main">{message}</span>
      </div>
      {onClose && (
        <button type="button" className="btn-close btn-close-white ms-auto" onClick={onClose} aria-label="Close" />
      )}
    </div>
  );
};
