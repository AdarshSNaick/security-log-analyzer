import { FiEye, FiTrash2 } from 'react-icons/fi';
import { getSeverityBadgeClass, getStatusBadgeClass } from '../../utils/formatters';

export const LogTable = ({ logs, onViewDetails, onDelete, showActions = true }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p className="mb-0">No security log entries match your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="soc-table-container">
      <table className="soc-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Username</th>
            <th>IP Address</th>
            <th>Event Type</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Source</th>
            {showActions && <th className="text-end">Action</th>}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="font-monospace text-muted small">{log.timestamp}</td>
              <td className="fw-semibold text-bright">{log.username}</td>
              <td className="font-monospace text-cyan">{log.ip}</td>
              <td className="text-main">{log.event}</td>
              <td>
                <span className={`soc-badge ${getStatusBadgeClass(log.status)}`}>
                  {log.status}
                </span>
              </td>
              <td>
                <span className={`soc-badge ${getSeverityBadgeClass(log.severity)}`}>
                  {log.severity}
                </span>
              </td>
              <td className="small text-muted">{log.source}</td>
              {showActions && (
                <td className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-cyan p-1 text-cyan border-0"
                      title="View Log Details"
                      onClick={() => onViewDetails && onViewDetails(log)}
                    >
                      <FiEye size={16} />
                    </button>
                    {onDelete && (
                      <button
                        className="btn btn-sm p-1 text-danger border-0"
                        title="Delete Log Entry"
                        onClick={() => onDelete(log.id)}
                      >
                        <FiTrash2 size={16} />
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
