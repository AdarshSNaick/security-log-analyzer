import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
  FiFileText,
  FiShieldOff,
  FiAlertOctagon,
  FiAlertTriangle,
  FiActivity,
  FiUsers,
  FiRefreshCw,
  FiZap,
} from 'react-icons/fi';

import { logService } from '../services/logService';
import { alertService } from '../services/alertService';

import { StatCard } from '../components/Cards/StatCard';
import { ChartCard } from '../components/Cards/ChartCard';

import { LogStatusChart } from '../components/Charts/LogStatusChart';
import { ThreatSeverityChart } from '../components/Charts/ThreatSeverityChart';
import { LogTimelineChart } from '../components/Charts/LogTimelineChart';
import { SuspiciousIPChart } from '../components/Charts/SuspiciousIPChart';

import { LogTable } from '../components/Tables/LogTable';
import { AlertTable } from '../components/Tables/AlertTable';

import { Loader } from '../components/Loader/Loader';
import { Modal } from '../components/Modal/Modal';
import { Button } from '../components/Buttons/Button';

import {
  getSeverityBadgeClass,
  getStatusBadgeClass,
} from '../utils/formatters';


export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);


  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const [
        statsData,
        logsData,
        alertsData,
      ] = await Promise.all([
        logService.getDashboardStats(),
        logService.getLogs(),
        alertService.getAlerts(),
      ]);

      setStats(statsData);

      setRecentLogs(
        Array.isArray(logsData)
          ? logsData.slice(0, 5)
          : []
      );

      setRecentAlerts(
        Array.isArray(alertsData)
          ? alertsData.slice(0, 5)
          : []
      );

    } catch (err) {
      console.error(
        'Failed to load dashboard telemetry:',
        err
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleResolveAlert = async (id) => {
    try {
      await alertService.resolveAlert(id);

      setRecentAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? {
                ...alert,
                status: 'RESOLVED',
              }
            : alert
        )
      );

    } catch (err) {
      console.error(
        'Failed to resolve alert:',
        err
      );
    }
  };


  if (loading && !stats) {
    return (
      <Loader
        text="Initializing Security Log Analyzer..."
        fullPage
      />
    );
  }


  return (
    <div className="d-flex flex-column gap-4">

      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-dark p-4 rounded-4 border border-secondary">

        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="soc-badge soc-badge-critical pulse-alert">
              SECURITY MONITORING
            </span>

            <span className="small text-muted font-monospace">
              SOC STATUS: ACTIVE
            </span>
          </div>

          <h2 className="fw-extrabold text-bright mb-1">
            Security Operations Command Center
          </h2>

          <p className="small text-muted mb-0">
            Security log monitoring, threat detection and incident analysis
          </p>
        </div>


        <div className="d-flex align-items-center gap-2">

          <Button
            variant="outline"
            icon={FiRefreshCw}
            onClick={fetchDashboardData}
            isLoading={loading}
          >
            Sync Feed
          </Button>

          <Link
            to="/upload"
            className="btn soc-btn-primary d-inline-flex align-items-center gap-2"
          >
            <FiZap size={18} />
            Ingest Log File
          </Link>

        </div>

      </div>


      {/* Statistics */}
      <div className="row g-3">

        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Total Logs"
            value={stats?.totalLogs}
            icon={FiFileText}
            color="cyan"
          />
        </div>


        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Threats Detected"
            value={stats?.threatsDetected}
            icon={FiShieldOff}
            color="high"
          />
        </div>


        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Critical Alerts"
            value={stats?.criticalAlerts}
            icon={FiAlertOctagon}
            color="critical"
          />
        </div>


        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="High Severity"
            value={stats?.highSeverityAlerts}
            icon={FiAlertTriangle}
            color="high"
          />
        </div>


        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Today's Events"
            value={stats?.todayEvents}
            icon={FiActivity}
            color="blue"
          />
        </div>


        <div className="col-12 col-sm-6 col-xl-2">
          <StatCard
            title="Active Operators"
            value={stats?.activeUsers}
            icon={FiUsers}
            color="success"
          />
        </div>

      </div>


      {/* Charts */}
      <div className="row g-4">

        <div className="col-12 col-lg-6 col-xl-3">
          <ChartCard
            title="Login Status"
            subtitle="Success vs Failed Authentications"
          >
            <LogStatusChart
              successCount={stats?.successLogins}
              failedCount={stats?.failedLogins}
            />
          </ChartCard>
        </div>


        <div className="col-12 col-lg-6 col-xl-3">
          <ChartCard
            title="Threats by Severity"
            subtitle="Critical to Low Distribution"
          >
            <ThreatSeverityChart
              data={stats?.threatsBySeverity}
            />
          </ChartCard>
        </div>


        <div className="col-12 col-lg-6 col-xl-3">
          <ChartCard
            title="Logs Over Time"
            subtitle="24-Hour Telemetry Volume"
          >
            <LogTimelineChart
              data={stats?.logsOverTime}
            />
          </ChartCard>
        </div>


        <div className="col-12 col-lg-6 col-xl-3">
          <ChartCard
            title="Top Suspicious IPs"
            subtitle="Most Detected Source Addresses"
          >
            <SuspiciousIPChart
              data={stats?.topSuspiciousIPs}
            />
          </ChartCard>
        </div>

      </div>


      {/* Live Telemetry Tables */}
      <div className="row g-4">

        {/* Recent Security Logs */}
        <div className="col-12 col-xl-7">

          <div className="soc-card p-4">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>
                <h5 className="fw-bold text-bright mb-1">
                  Recent Security Logs
                </h5>

                <p className="small text-muted mb-0">
                  Latest log entries processed by the analyzer
                </p>
              </div>

              <Link
                to="/logs"
                className="small text-cyan text-decoration-none fw-bold"
              >
                Log Inspector →
              </Link>

            </div>


            <LogTable
              logs={recentLogs}
              onViewDetails={(log) =>
                setSelectedLog(log)
              }
              showActions={true}
            />

          </div>

        </div>


        {/* Recent Security Alerts */}
        <div className="col-12 col-xl-5">

          <div className="soc-card p-4">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <div>
                <h5 className="fw-bold text-bright mb-1">
                  Recent Security Alerts
                </h5>

                <p className="small text-muted mb-0">
                  Alerts generated by the threat detection engine
                </p>
              </div>

              <Link
                to="/alerts"
                className="small text-cyan text-decoration-none fw-bold"
              >
                Alert Center →
              </Link>

            </div>


            <AlertTable
              alerts={recentAlerts}
              onResolve={handleResolveAlert}
              showActions={true}
            />

          </div>

        </div>

      </div>


      {/* Log Details Modal */}
      {selectedLog && (

        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Log Details [${selectedLog.id}]`}
          footer={
            <Button
              variant="outline"
              onClick={() => setSelectedLog(null)}
            >
              Close Inspector
            </Button>
          }
        >

          <div className="d-flex flex-column gap-3">

            <div className="row g-3">

              <div className="col-6">
                <span className="small text-muted d-block font-monospace">
                  Timestamp
                </span>

                <span className="font-monospace text-bright">
                  {selectedLog.timestamp}
                </span>
              </div>


              <div className="col-6">
                <span className="small text-muted d-block font-monospace">
                  IP Address
                </span>

                <span className="font-monospace text-cyan fw-bold">
                  {selectedLog.ip}
                </span>
              </div>


              <div className="col-6">
                <span className="small text-muted d-block font-monospace">
                  Username
                </span>

                <span className="text-bright fw-bold">
                  {selectedLog.username}
                </span>
              </div>


              <div className="col-6">
                <span className="small text-muted d-block font-monospace">
                  Source File
                </span>

                <span className="text-main">
                  {selectedLog.source}
                </span>
              </div>


              <div className="col-6">
                <span className="small text-muted d-block font-monospace">
                  Severity
                </span>

                <span
                  className={`soc-badge ${getSeverityBadgeClass(
                    selectedLog.severity
                  )}`}
                >
                  {selectedLog.severity}
                </span>
              </div>


              <div className="col-6">
                <span className="small text-muted d-block font-monospace">
                  Status
                </span>

                <span
                  className={`soc-badge ${getStatusBadgeClass(
                    selectedLog.status
                  )}`}
                >
                  {selectedLog.status}
                </span>
              </div>

            </div>


            <div className="pt-2 border-top border-secondary">

              <span className="small text-muted d-block mb-1 font-monospace">
                Raw Payload Message
              </span>

              <div
                className="bg-dark p-3 rounded font-monospace small text-cyan border border-secondary"
                style={{
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedLog.details ||
                  selectedLog.event}
              </div>

            </div>

          </div>

        </Modal>

      )}

    </div>
  );
};