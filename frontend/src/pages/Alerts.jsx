import { useState, useEffect, useMemo } from 'react';

import {
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';

import { alertService } from '../services/alertService';

import { AlertTable } from '../components/Tables/AlertTable';
import { SearchBar } from '../components/Inputs/SearchBar';
import { Loader } from '../components/Loader/Loader';
import { Modal } from '../components/Modal/Modal';
import { Button } from '../components/Buttons/Button';
import { AlertBanner } from '../components/Alerts/AlertBanner';

import {
  getSeverityBadgeClass,
  getStatusBadgeClass,
} from '../utils/formatters';


export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [successMsg, setSuccessMsg] = useState('');

  // Selected alert for details modal
  const [selectedAlert, setSelectedAlert] = useState(null);


  /* ---------------------------------------------------------
     Fetch alerts from Django API
  --------------------------------------------------------- */

  const fetchAlerts = async () => {
    setLoading(true);

    try {
      const data = await alertService.getAlerts();

      setAlerts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        'Failed to fetch security alerts:',
        err
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAlerts();
  }, []);


  /* ---------------------------------------------------------
     Resolve alert
  --------------------------------------------------------- */

  const handleResolveAlert = async (id) => {
    try {
      await alertService.resolveAlert(id);

      setAlerts((prev) =>
        prev.map((alert) =>
          String(alert.id) === String(id)
            ? {
                ...alert,
                status: 'RESOLVED',
              }
            : alert
        )
      );

      setSelectedAlert((prev) => {
        if (
          prev &&
          String(prev.id) === String(id)
        ) {
          return {
            ...prev,
            status: 'RESOLVED',
          };
        }

        return prev;
      });

      setSuccessMsg(
        `Alert ${id} has been marked as RESOLVED.`
      );

    } catch (err) {
      console.error(
        'Failed to resolve alert:',
        err
      );
    }
  };


  /* ---------------------------------------------------------
     Filter alerts
  --------------------------------------------------------- */

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {

      const title = String(
        alert.title ?? ''
      ).toLowerCase();

      const description = String(
        alert.description ?? ''
      ).toLowerCase();

      const id = String(
        alert.id ?? ''
      ).toLowerCase();

      const source = String(
        alert.source ?? ''
      ).toLowerCase();

      const severity = String(
        alert.severity ?? ''
      ).toUpperCase();

      const status = String(
        alert.status ?? ''
      ).toUpperCase();


      /* Search */

      if (searchQuery.trim()) {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        const matches =
          title.includes(query) ||
          description.includes(query) ||
          id.includes(query) ||
          source.includes(query);

        if (!matches) {
          return false;
        }
      }


      /* Severity */

      if (
        severityFilter !== 'All' &&
        severity !==
          severityFilter.toUpperCase()
      ) {
        return false;
      }


      /* Status */

      if (
        statusFilter !== 'All' &&
        status !==
          statusFilter.toUpperCase()
      ) {
        return false;
      }


      return true;
    });

  }, [
    alerts,
    searchQuery,
    severityFilter,
    statusFilter,
  ]);


  /* ---------------------------------------------------------
     Active severity counts
  --------------------------------------------------------- */

  const severityCounts = useMemo(() => {

    const activeAlerts = alerts.filter(
      (alert) => {
        const status = String(
          alert.status ?? ''
        ).toUpperCase();

        return status !== 'RESOLVED';
      }
    );


    return {
      Critical: activeAlerts.filter(
        (alert) =>
          String(
            alert.severity ?? ''
          ).toUpperCase() === 'CRITICAL'
      ).length,

      High: activeAlerts.filter(
        (alert) =>
          String(
            alert.severity ?? ''
          ).toUpperCase() === 'HIGH'
      ).length,

      Medium: activeAlerts.filter(
        (alert) =>
          String(
            alert.severity ?? ''
          ).toUpperCase() === 'MEDIUM'
      ).length,

      Low: activeAlerts.filter(
        (alert) =>
          String(
            alert.severity ?? ''
          ).toUpperCase() === 'LOW'
      ).length,
    };

  }, [alerts]);


  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */

  return (
    <div className="d-flex flex-column gap-4">


      {/* -----------------------------------------------------
          Header
      ----------------------------------------------------- */}

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

        <div>

          <h2 className="fw-bold text-bright mb-1">
            Real-Time Security Alerts
          </h2>

          <p className="small text-muted mb-0">
            Security alerts generated by the threat detection engine
          </p>

        </div>


        <Button
          variant="outline"
          icon={FiRefreshCw}
          onClick={fetchAlerts}
          isLoading={loading}
        >
          Refresh Alerts
        </Button>

      </div>


      {/* -----------------------------------------------------
          Success Message
      ----------------------------------------------------- */}

      {successMsg && (
        <AlertBanner
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />
      )}


      {/* -----------------------------------------------------
          Severity Summary
      ----------------------------------------------------- */}

      <div className="row g-3">

        {[
          {
            label: 'Critical',
            count: severityCounts.Critical,
            color: 'critical',
          },
          {
            label: 'High',
            count: severityCounts.High,
            color: 'high',
          },
          {
            label: 'Medium',
            count: severityCounts.Medium,
            color: 'medium',
          },
          {
            label: 'Low',
            count: severityCounts.Low,
            color: 'low',
          },
        ].map((item) => (

          <div
            key={item.label}
            className="col-6 col-md-3"
          >

            <div
              onClick={() =>
                setSeverityFilter(
                  severityFilter === item.label
                    ? 'All'
                    : item.label
                )
              }
              className={`soc-card p-3 d-flex align-items-center justify-content-between cursor-pointer ${
                severityFilter === item.label
                  ? 'border-cyan'
                  : ''
              }`}
              style={{
                cursor: 'pointer',
              }}
            >

              <div>

                <span className="small text-muted d-block fw-semibold">
                  {item.label} Alerts
                </span>

                <h4 className="fw-bold text-bright mb-0">
                  {item.count} Active
                </h4>

              </div>


              <span
                className={`soc-badge soc-badge-${item.color} fs-6`}
              >
                {item.label}
              </span>

            </div>

          </div>

        ))}

      </div>


      {/* -----------------------------------------------------
          Filters
      ----------------------------------------------------- */}

      <div className="soc-card p-4">

        <div className="row g-3">

          <div className="col-12 col-md-6">

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search alerts by title, ID, or source..."
            />

          </div>


          <div className="col-6 col-md-3">

            <select
              className="form-select soc-input"
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Severities
              </option>

              <option value="Critical">
                Critical Only
              </option>

              <option value="High">
                High Only
              </option>

              <option value="Medium">
                Medium Only
              </option>

              <option value="Low">
                Low Only
              </option>

            </select>

          </div>


          <div className="col-6 col-md-3">

            <select
              className="form-select soc-input"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Statuses
              </option>

              <option value="OPEN">
                Open
              </option>

              <option value="ACKNOWLEDGED">
                Acknowledged
              </option>

              <option value="RESOLVED">
                Resolved
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* -----------------------------------------------------
          Alerts Table
      ----------------------------------------------------- */}

      <div className="soc-card p-4">

        {loading ? (

          <Loader
            text="Loading Security Alerts..."
          />

        ) : (

          <AlertTable
            alerts={filteredAlerts}
            onView={(alert) =>
              setSelectedAlert(alert)
            }
            onResolve={handleResolveAlert}
            showActions={true}
          />

        )}

      </div>


      {/* -----------------------------------------------------
          Alert Details Modal
      ----------------------------------------------------- */}

      {selectedAlert && (

        <Modal
          isOpen={!!selectedAlert}
          onClose={() =>
            setSelectedAlert(null)
          }

          title={`Alert Details [${selectedAlert.id}]`}

          footer={

            <div className="d-flex align-items-center justify-content-between w-100">

              {String(
                selectedAlert.status ?? ''
              ).toUpperCase() !== 'RESOLVED' ? (

                <Button
                  variant="success"
                  icon={FiCheckCircle}
                  onClick={() =>
                    handleResolveAlert(
                      selectedAlert.id
                    )
                  }
                >
                  Mark as Resolved
                </Button>

              ) : (

                <span className="soc-badge soc-badge-success">
                  Resolved
                </span>

              )}


              <Button
                variant="outline"
                onClick={() =>
                  setSelectedAlert(null)
                }
              >
                Close
              </Button>

            </div>
          }
        >

          <div className="d-flex flex-column gap-3">


            {/* Alert title */}

            <div>

              <h5 className="fw-bold text-bright mb-1">
                {selectedAlert.title}
              </h5>

              <span className="small text-muted font-monospace">
                {selectedAlert.timestamp}
              </span>

            </div>


            {/* Alert information */}

            <div className="row g-3 pt-2 border-top border-secondary">


              <div className="col-6">

                <span className="small text-muted d-block">
                  Severity Rating
                </span>

                <span
                  className={`soc-badge ${getSeverityBadgeClass(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>

              </div>


              <div className="col-6">

                <span className="small text-muted d-block">
                  Alert Status
                </span>

                <span
                  className={`soc-badge ${getStatusBadgeClass(
                    selectedAlert.status
                  )}`}
                >
                  {selectedAlert.status}
                </span>

              </div>


              <div className="col-6">

                <span className="small text-muted d-block">
                  Detector Source
                </span>

                <span className="text-cyan fw-semibold">
                  {selectedAlert.source}
                </span>

              </div>


              <div className="col-6">

                <span className="small text-muted d-block">
                  Assigned Responder
                </span>

                <span className="text-bright">
                  {selectedAlert.assignedTo ||
                    'Unassigned'}
                </span>

              </div>

            </div>


            {/* Description */}

            <div className="pt-2 border-top border-secondary">

              <span className="small text-muted d-block mb-1">
                Threat Description & Evidence
              </span>

              <p className="small text-main bg-dark p-3 rounded border border-secondary mb-0">
                {selectedAlert.description}
              </p>

            </div>

          </div>

        </Modal>

      )}

    </div>
  );
};