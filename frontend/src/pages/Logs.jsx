import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiDownload, FiFilter, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';
import { logService } from '../services/logService';
import { LogTable } from '../components/Tables/LogTable';
import { SearchBar } from '../components/Inputs/SearchBar';
import { Pagination } from '../components/Pagination/Pagination';
import { Loader } from '../components/Loader/Loader';
import { Modal } from '../components/Modal/Modal';
import { Button } from '../components/Buttons/Button';
import { exportToCSV } from '../utils/exportUtils';
import { getSeverityBadgeClass, getStatusBadgeClass } from '../utils/formatters';

export const Logs = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp-desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await logService.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = async (id) => {
    await logService.deleteLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleCopyPayload = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Quick Filter preset handler
  const applyQuickFilter = (preset) => {
    setCurrentPage(1);
    if (preset === 'critical') {
      setSeverityFilter('Critical');
      setStatusFilter('All');
    } else if (preset === 'failed') {
      setSeverityFilter('All');
      setStatusFilter('Failed');
    } else if (preset === 'waf') {
      setSearchQuery('WAF');
      setSeverityFilter('All');
      setStatusFilter('All');
    } else {
      setSeverityFilter('All');
      setStatusFilter('All');
      setSearchQuery('');
      setDateFilter('');
    }
  };

  // Filter & Sort Logic
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            String(log.username ?? '').toLowerCase().includes(q) ||
            String(log.ip ?? '').toLowerCase().includes(q) ||
            String(log.event ?? '').toLowerCase().includes(q) ||
            String(log.source ?? '').toLowerCase().includes(q) ||
            String(log.id ?? '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (severityFilter !== 'All' && log.severity.toLowerCase() !== severityFilter.toLowerCase()) {
          return false;
        }

        if (statusFilter !== 'All' && log.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }

        if (dateFilter && !log.timestamp.includes(dateFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'timestamp-desc') {
          return new Date(b.timestamp) - new Date(a.timestamp);
        }
        if (sortBy === 'timestamp-asc') {
          return new Date(a.timestamp) - new Date(b.timestamp);
        }
        if (sortBy === 'severity') {
          const ranks = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (ranks[b.severity] || 0) - (ranks[a.severity] || 0);
        }
        if (sortBy === 'username') {
          return a.username.localeCompare(b.username);
        }
        return 0;
      });
  }, [logs, searchQuery, severityFilter, statusFilter, dateFilter, sortBy]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleExportCSV = () => {
    exportToCSV('security_log_inspector_export', filteredLogs);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h2 className="fw-bold text-bright mb-1">Security Log Inspector</h2>
          <p className="small text-muted mb-0">Deep packet audit stream, telemetry search & log filtering engine</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button variant="outline" icon={FiRefreshCw} onClick={fetchLogs} isLoading={loading}>
            Refresh Stream
          </Button>
          <Button variant="primary" icon={FiDownload} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Preset Filter Chips */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span className="small text-muted font-monospace me-2">QUICK PRESETS:</span>
        <button
          className={`btn btn-sm ${severityFilter === 'Critical' ? 'soc-btn-primary' : 'btn-outline-danger'}`}
          onClick={() => applyQuickFilter('critical')}
        >
          🚨 Critical Threats Only
        </button>
        <button
          className={`btn btn-sm ${statusFilter === 'Failed' ? 'soc-btn-primary' : 'btn-outline-warning'}`}
          onClick={() => applyQuickFilter('failed')}
        >
          ❌ Failed Logins
        </button>
        <button
          className={`btn btn-sm ${searchQuery === 'WAF' ? 'soc-btn-primary' : 'btn-outline-cyan'}`}
          onClick={() => applyQuickFilter('waf')}
        >
          🛡️ WAF Payloads
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => applyQuickFilter('reset')}
        >
          Reset All Filters
        </button>
      </div>

      {/* Filter Toolbar Card */}
      <div className="soc-card p-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label text-muted small fw-bold font-monospace mb-1">Search Keywords</label>
            <SearchBar value={searchQuery} onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }} />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label text-muted small fw-bold font-monospace mb-1">Severity</label>
            <select
              className="form-select soc-input"
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label text-muted small fw-bold font-monospace mb-1">Status</label>
            <select
              className="form-select soc-input"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Blocked">Blocked</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label text-muted small fw-bold font-monospace mb-1">Filter Date</label>
            <input
              type="date"
              className="form-control soc-input"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label text-muted small fw-bold font-monospace mb-1">Sort Order</label>
            <select
              className="form-select soc-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="timestamp-desc">Newest First</option>
              <option value="timestamp-asc">Oldest First</option>
              <option value="severity">Highest Severity</option>
              <option value="username">Username A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="soc-card p-4">
        {loading ? (
          <Loader text="Querying Log Inspector Database..." />
        ) : (
          <>
            <LogTable
              logs={currentLogs}
              onViewDetails={(log) => setSelectedLog(log)}
              onDelete={handleDeleteLog}
              showActions={true}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
            />
          </>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Security Log Payload [${selectedLog.id}]`}
          footer={
            <div className="d-flex justify-content-between align-items-center w-100">
              <Button variant="danger" size="sm" onClick={() => { handleDeleteLog(selectedLog.id); setSelectedLog(null); }}>
                Delete Entry
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          }
        >
          <div className="d-flex flex-column gap-3">
            <div className="row g-3">
              <div className="col-6">
                <span className="small text-muted font-monospace d-block">Log ID</span>
                <span className="font-monospace text-cyan fw-bold">{selectedLog.id}</span>
              </div>
              <div className="col-6">
                <span className="small text-muted font-monospace d-block">Timestamp</span>
                <span className="font-monospace text-bright">{selectedLog.timestamp}</span>
              </div>
              <div className="col-6">
                <span className="small text-muted font-monospace d-block">IP Address</span>
                <span className="font-monospace text-cyan fw-bold">{selectedLog.ip}</span>
              </div>
              <div className="col-6">
                <span className="small text-muted font-monospace d-block">Username / Principal</span>
                <span className="text-bright fw-bold">{selectedLog.username}</span>
              </div>
              <div className="col-6">
                <span className="small text-muted font-monospace d-block">Severity Level</span>
                <span className={`soc-badge ${getSeverityBadgeClass(selectedLog.severity)}`}>
                  {selectedLog.severity}
                </span>
              </div>
              <div className="col-6">
                <span className="small text-muted font-monospace d-block">Execution Status</span>
                <span className={`soc-badge ${getStatusBadgeClass(selectedLog.status)}`}>
                  {selectedLog.status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-top border-secondary">
              <span className="small text-muted font-monospace d-block mb-1">Source Agent / Ingest Gateway</span>
              <span className="text-bright fw-semibold">{selectedLog.source}</span>
            </div>

            <div className="pt-2 border-top border-secondary">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small text-muted font-monospace">Full Raw Log JSON Payload</span>
                <button
                  className="btn btn-sm btn-outline-cyan py-0 px-2 small font-monospace d-flex align-items-center gap-1"
                  onClick={() => handleCopyPayload(JSON.stringify(selectedLog, null, 2))}
                >
                  {copiedPayload ? <FiCheck size={14} className="text-success" /> : <FiCopy size={14} />}
                  {copiedPayload ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="bg-dark p-3 rounded font-monospace small text-cyan border border-secondary mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
