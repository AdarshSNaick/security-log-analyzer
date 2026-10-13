import { FiEye, FiCheckCircle } from 'react-icons/fi';
import { getSeverityBadgeClass, getStatusBadgeClass } from '../../utils/formatters';

export const AlertTable = ({ alerts, onView, onResolve, showActions = true }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p className="mb-0">No active security alerts match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="soc-table-container">
      <table className="soc-table">
        <thead>
          <tr>
            <th>Alert Title</th>
            <th>Severity</th>
            <th>Timestamp</th>
            <th>Source</th>
            <th>Status</th>
            {showActions && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>
                <div>
                  <span className="fw-semibold text-bright d-block">{alert.title}</span>
                  <span className="small text-muted">{alert.description?.substring(0, 50)}...</span>
                </div>
              </td>
              <td>
                <span className={`soc-badge ${getSeverityBadgeClass(alert.severity)}`}>
                  {alert.severity}
                </span>
              </td>
              <td className="font-monospace text-muted small">{alert.timestamp}</td>
              <td className="small text-cyan">{alert.source}</td>
              <td>
                <span className={`soc-badge ${getStatusBadgeClass(alert.status)}`}>
                  {alert.status}
                </span>
              </td>
              {showActions && (
                <td className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2">
                    <button
                      className="btn btn-sm text-cyan p-1 border-0"
                      title="View Alert Details"
                      onClick={() => onView && onView(alert)}
                    >
                      <FiEye size={18} />
                    </button>
                    {alert.status !== 'Resolved' && onResolve && (
                      <button
                        className="btn btn-sm text-success p-1 border-0"
                        title="Mark as Resolved"
                        onClick={() => onResolve(alert.id)}
                      >
                        <FiCheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
