import { useState, useEffect, useMemo } from 'react';

import {
  FiActivity,
  FiShield,
  FiClock,
  FiCheckSquare,
  FiRefreshCw,
} from 'react-icons/fi';

import { incidentService } from '../services/incidentService';

import { Loader } from '../components/Loader/Loader';
import { Button } from '../components/Buttons/Button';
import { AlertBanner } from '../components/Alerts/AlertBanner';

import {
  getSeverityBadgeClass,
  getStatusBadgeClass,
} from '../utils/formatters';


export const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');


  /* =========================================================
     FETCH INCIDENTS
     ========================================================= */

  const fetchIncidents = async () => {
    setLoading(true);

    try {
      const data = await incidentService.getIncidents();

      const incidentData = Array.isArray(data) ? data : [];

      setIncidents(incidentData);

      setSelectedIncident((current) => {
        if (!incidentData.length) {
          return null;
        }

        if (!current) {
          return incidentData[0];
        }

        const updatedSelected = incidentData.find(
          (incident) =>
            String(incident.id) === String(current.id)
        );

        return updatedSelected || incidentData[0];
      });

    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchIncidents();
  }, []);


  /* =========================================================
     UPDATE INCIDENT STATUS
     ========================================================= */

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const updatedIncident =
        await incidentService.updateStatus(id, newStatus);

      setIncidents((prev) =>
        prev.map((incident) =>
          String(incident.id) === String(id)
            ? updatedIncident
            : incident
        )
      );

      setSelectedIncident((prev) =>
        prev &&
        String(prev.id) === String(id)
          ? updatedIncident
          : prev
      );

      setSuccessMsg(
        `Incident ${id} status updated to ${newStatus}.`
      );

      setTimeout(() => setSuccessMsg(''), 4000);

    } catch (err) {
      console.error('Failed to update incident:', err);

      setSuccessMsg(
        'Failed to update incident status.'
      );

      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };


  /* =========================================================
     RELATED ALERTS
     ========================================================= */

  const relatedAlerts = useMemo(() => {
    if (!selectedIncident) {
      return [];
    }

    if (Array.isArray(selectedIncident.alerts)) {
      return selectedIncident.alerts;
    }

    return [];
  }, [selectedIncident]);


  /* =========================================================
     INCIDENT TIMELINE
     ========================================================= */

  const timeline = useMemo(() => {
    if (!selectedIncident) {
      return [];
    }

    const events = [];

    if (selectedIncident.detectedAt) {
      events.push({
        time: selectedIncident.detectedAt,
        event: 'Security incident detected.',
      });
    }

    relatedAlerts.forEach((alert) => {
      const timestamp =
        alert.timestamp ||
        alert.createdAt ||
        alert.created_at ||
        alert.detectedAt ||
        alert.detected_at;

      const title =
        alert.title ||
        alert.message ||
        'Security alert generated';

      if (timestamp) {
        events.push({
          time: timestamp,
          event: title,
        });
      }
    });

    if (
      selectedIncident.status === 'INVESTIGATING' &&
      (selectedIncident.updatedAt ||
        selectedIncident.updated_at)
    ) {
      events.push({
        time:
          selectedIncident.updatedAt ||
          selectedIncident.updated_at,
        event:
          'Incident status changed to INVESTIGATING.',
      });
    }

    if (
      selectedIncident.status === 'RESOLVED' &&
      (selectedIncident.updatedAt ||
        selectedIncident.updated_at)
    ) {
      events.push({
        time:
          selectedIncident.updatedAt ||
          selectedIncident.updated_at,
        event:
          'Incident status changed to RESOLVED.',
      });
    }

    return events
      .filter((event) => event.time)
      .sort(
        (a, b) =>
          new Date(a.time) - new Date(b.time)
      );

  }, [selectedIncident, relatedAlerts]);


  /* =========================================================
     REMEDIATION GUIDANCE
     ========================================================= */

  const remediationActions = useMemo(() => {
    if (!selectedIncident) {
      return [];
    }

    const threatTypes = relatedAlerts
      .map(
        (alert) =>
          alert.threatType ||
          alert.threat_type ||
          alert.detection?.threatType ||
          alert.detection?.threat_type ||
          ''
      )
      .map((type) => String(type).toUpperCase());

    const actions = [];

    if (threatTypes.includes('BRUTE_FORCE')) {
      actions.push(
        'Review failed login activity from the affected source IP.'
      );

      actions.push(
        'Consider temporarily restricting repeated authentication attempts from the source IP.'
      );

      actions.push(
        'Review the affected account for unauthorized access.'
      );
    }

    if (threatTypes.includes('SQL_INJECTION')) {
      actions.push(
        'Review the affected application request and associated SQL input.'
      );

      actions.push(
        'Validate server-side input handling and parameterized database queries.'
      );
    }

    if (threatTypes.includes('PORT_SCAN')) {
      actions.push(
        'Review the source IP for additional connection attempts.'
      );

      actions.push(
        'Check exposed services and unnecessary open ports on the affected host.'
      );
    }

    if (threatTypes.includes('UNAUTHORIZED_ACCESS')) {
      actions.push(
        'Review access attempts to restricted application paths.'
      );

      actions.push(
        'Verify that administrative and configuration resources require appropriate authentication.'
      );
    }

    if (threatTypes.includes('SUSPICIOUS_REQUEST')) {
      actions.push(
        'Review the suspicious request payload and originating source.'
      );
    }

    if (!actions.length) {
      actions.push(
        'Review the related security logs and alerts for additional evidence.'
      );

      actions.push(
        'Investigate the source IP and affected host for related activity.'
      );
    }

    return [...new Set(actions)];

  }, [selectedIncident, relatedAlerts]);


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <Loader
        text="Loading SOC Security Incident Matrix..."
      />
    );
  }


  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <div className="d-flex flex-column gap-4">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

        <div>
          <h2 className="fw-bold text-bright mb-1">
            Cyber Incident Response Center
          </h2>

          <p className="small text-muted mb-0">
            Security incidents generated from detected threats and alerts
          </p>
        </div>

        <Button
          variant="outline"
          icon={FiRefreshCw}
          onClick={fetchIncidents}
          isLoading={loading}
        >
          Refresh Incidents
        </Button>

      </div>


      {/* =====================================================
          SUCCESS MESSAGE
          ===================================================== */}

      {successMsg && (
        <AlertBanner
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />
      )}


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="row g-4">

        {/* ===================================================
            INCIDENT LIST
            =================================================== */}

        <div className="col-12 col-lg-5">

          <div className="d-flex flex-column gap-3">

            {incidents.length === 0 ? (

              <div className="soc-card p-5 text-center text-muted">

                <FiActivity
                  size={48}
                  className="mb-3 text-cyan"
                />

                <p className="mb-0">
                  No security incidents have been detected.
                </p>

              </div>

            ) : (

              incidents.map((incident) => {

                const isSelected =
                  selectedIncident?.id === incident.id;

                return (

                  <div
                    key={incident.id}
                    onClick={() =>
                      setSelectedIncident(incident)
                    }
                    className={`soc-card p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan shadow-lg'
                        : ''
                    }`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        isSelected
                          ? 'rgba(0, 242, 254, 0.06)'
                          : 'var(--soc-bg-card)',
                    }}
                  >

                    <div className="d-flex align-items-center justify-content-between mb-2">

                      <span className="font-monospace text-cyan small fw-bold">
                        {incident.id}
                      </span>

                      <span
                        className={`soc-badge ${getSeverityBadgeClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>

                    </div>


                    <h5 className="fw-bold text-bright mb-2">
                      {incident.title}
                    </h5>


                    <p className="small text-muted mb-3">
                      {incident.description
                        ? incident.description.length > 85
                          ? `${incident.description.substring(
                              0,
                              85
                            )}...`
                          : incident.description
                        : 'No incident description available.'}
                    </p>


                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary small">

                      <span className="text-muted font-monospace">
                        {incident.detectedAt}
                      </span>

                      <span
                        className={`soc-badge ${getStatusBadgeClass(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>

                    </div>

                  </div>

                );
              })

            )}

          </div>

        </div>


        {/* ===================================================
            INCIDENT DETAILS
            =================================================== */}

        <div className="col-12 col-lg-7">

          {selectedIncident ? (

            <div className="soc-card p-4 p-md-5">

              {/* =============================================
                  INCIDENT HEADER
                  ============================================= */}

              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pb-3 mb-4 border-bottom border-secondary">

                <div>

                  <div className="d-flex align-items-center gap-2 mb-1">

                    <span className="font-monospace text-cyan fw-bold fs-5">
                      {selectedIncident.id}
                    </span>

                    <span
                      className={`soc-badge ${getSeverityBadgeClass(
                        selectedIncident.severity
                      )}`}
                    >
                      {selectedIncident.severity}
                    </span>

                  </div>


                  <h3 className="fw-bold text-bright mb-0">
                    {selectedIncident.title}
                  </h3>

                </div>


                <div className="d-flex align-items-center gap-2">

                  {selectedIncident.status !== 'RESOLVED' && (

                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedIncident.id,
                          'RESOLVED'
                        )
                      }
                    >
                      Resolve Incident
                    </Button>

                  )}


                  {selectedIncident.status === 'OPEN' && (

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedIncident.id,
                          'INVESTIGATING'
                        )
                      }
                    >
                      Investigate
                    </Button>

                  )}

                </div>

              </div>


              {/* =============================================
                  TARGET + SOURCE INFORMATION
                  LIGHT MODE FIX
                  ============================================= */}

              <div className="row g-3 mb-4">

                <div className="col-12 col-sm-6">

                  <div className="incident-dark-box p-3 rounded border border-secondary">

                    <span className="small d-block text-muted">
                      Target Asset / Infrastructure
                    </span>

                    <span className="fw-semibold incident-dark-text">
                      {selectedIncident.affectedAsset ||
                        selectedIncident.affected_asset ||
                        'Security Log Analyzer Host'}
                    </span>

                  </div>

                </div>


                <div className="col-12 col-sm-6">

                  <div className="incident-dark-box p-3 rounded border border-secondary">

                    <span className="small d-block text-muted">
                      Threat Vector / Source IP
                    </span>

                    <span className="font-monospace incident-cyan-text fw-bold">
                      {selectedIncident.sourceIp ||
                        selectedIncident.source_ip ||
                        'Unknown'}
                    </span>

                  </div>

                </div>

              </div>


              {/* =============================================
                  EXECUTIVE ASSESSMENT
                  LIGHT MODE FIX
                  ============================================= */}

              <div className="mb-4">

                <h6 className="fw-bold text-bright mb-2 d-flex align-items-center gap-2">

                  <FiShield className="text-cyan" />

                  Executive Incident Assessment

                </h6>


                <div className="incident-assessment-box p-3 rounded border">

                  <p className="small mb-0">
                    {selectedIncident.description ||
                      'No incident description is available.'}
                  </p>

                </div>

              </div>


              {/* =============================================
                  RELATED SECURITY ALERTS
                  LIGHT MODE FIX
                  ============================================= */}

              <div className="mb-4">

                <h6 className="fw-bold text-bright mb-3 d-flex align-items-center gap-2">

                  <FiActivity className="text-cyan" />

                  Related Security Alerts

                </h6>


                {relatedAlerts.length === 0 ? (

                  <div className="incident-related-alert p-3 rounded border border-secondary">

                    <span className="small incident-dark-text">
                      No related alerts are available for this incident.
                    </span>

                  </div>

                ) : (

                  <div className="d-flex flex-column gap-2">

                    {relatedAlerts.map((alert, index) => (

                      <div
                        key={alert.id ?? index}
                        className="incident-related-alert p-3 rounded border border-secondary"
                      >

                        <div className="d-flex align-items-center justify-content-between gap-3">

                          <span className="small fw-semibold incident-dark-text">
                            {alert.title ||
                              alert.message ||
                              'Security Alert'}
                          </span>

                          <span
                            className={`soc-badge ${getSeverityBadgeClass(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>

                        </div>


                        {alert.status && (

                          <span
                            className={`soc-badge mt-2 ${getStatusBadgeClass(
                              alert.status
                            )}`}
                          >
                            {alert.status}
                          </span>

                        )}

                      </div>

                    ))}

                  </div>

                )}

              </div>


              {/* =============================================
                  INCIDENT TIMELINE
                  ============================================= */}

              <div className="mb-4">

                <h6 className="fw-bold text-bright mb-3 d-flex align-items-center gap-2">

                  <FiClock className="text-cyan" />

                  Incident Sequence Timeline

                </h6>


                {timeline.length === 0 ? (

                  <div className="p-3 bg-dark rounded border border-secondary">

                    <span className="small text-muted">
                      Timeline information is not available for this incident.
                    </span>

                  </div>

                ) : (

                  <div className="position-relative ps-4 border-start border-cyan ms-2 d-flex flex-column gap-3">

                    {timeline.map((step, index) => (

                      <div
                        key={index}
                        className="position-relative"
                      >

                        <div
                          className="position-absolute start-0 top-0 translate-middle-x rounded-circle bg-cyan"
                          style={{
                            width: '10px',
                            height: '10px',
                            marginLeft: '-24px',
                            marginTop: '5px',
                          }}
                        />

                        <span className="font-monospace text-cyan small fw-bold">
                          {step.time}
                        </span>

                        <p className="small incident-timeline-text mb-0">
                          {step.event}
                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </div>


              {/* =============================================
                  REMEDIATION ACTIONS
                  ============================================= */}

              <div>

                <h6 className="fw-bold text-bright mb-3 d-flex align-items-center gap-2">

                  <FiCheckSquare className="text-cyan" />

                  Suggested Remediation Actions

                </h6>


                <div className="d-flex flex-column gap-2">

                  {remediationActions.map(
                    (action, index) => (

                      <div
                        key={index}
                        className="incident-related-alert p-3 rounded border border-secondary"
                      >

                        <span className="small incident-dark-text">
                          {action}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          ) : (

            <div className="soc-card p-5 text-center text-muted">

              <FiActivity
                size={48}
                className="mb-3 text-cyan"
              />

              <p>
                Select an incident from the list to inspect its details.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};