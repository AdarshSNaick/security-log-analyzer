import { useState, useEffect } from 'react';

import {
  FiDownload,
  FiPlus,
  FiFileText,
} from 'react-icons/fi';

import { reportService } from '../services/reportService';
import { logService } from '../services/logService';

import { Loader } from '../components/Loader/Loader';
import { Button } from '../components/Buttons/Button';
import { Modal } from '../components/Modal/Modal';
import { AlertBanner } from '../components/Alerts/AlertBanner';

import { getStatusBadgeClass } from '../utils/formatters';


export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [totalTelemetry, setTotalTelemetry] = useState(0);

  // Generate report modal
  const [showGenerateModal, setShowGenerateModal] =
    useState(false);

  const [reportTitle, setReportTitle] = useState(
    'Executive Threat Audit'
  );

  const [reportType, setReportType] = useState(
    'Security Threat Analysis'
  );

  const [reportFormat, setReportFormat] =
    useState('PDF');

  const [dateRange, setDateRange] =
    useState('Last 30 Days');


  /* ---------------------------------------------------------
     Fetch reports and telemetry
  --------------------------------------------------------- */

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const [reportData, logsData] =
        await Promise.all([
          reportService.getReports(),
          logService.getLogs(),
        ]);

      setReports(
        Array.isArray(reportData)
          ? reportData
          : []
      );

      setTotalTelemetry(
        Array.isArray(logsData)
          ? logsData.length
          : 0
      );

    } catch (err) {
      console.error(
        'Failed to fetch reports:',
        err
      );

      setErrorMsg(
        'Unable to load reports from the security analyzer.'
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReports();
  }, []);


  /* ---------------------------------------------------------
     Generate report
  --------------------------------------------------------- */

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    setGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const newReport =
        await reportService.generateReport({
          title: reportTitle,
          type: reportType,
          format: reportFormat,
          dateRange,
        });

      setReports((prev) => [
        newReport,
        ...prev,
      ]);

      setShowGenerateModal(false);

      setSuccessMsg(
        `Report "${newReport.name}" generated successfully.`
      );

      setTimeout(
        () => setSuccessMsg(''),
        4000
      );

    } catch (err) {
      console.error(
        'Report generation error:',
        err
      );

      setErrorMsg(
        'Unable to generate the report.'
      );

    } finally {
      setGenerating(false);
    }
  };


  /* ---------------------------------------------------------
     Download report
  --------------------------------------------------------- */

  const handleDownload = async (report) => {
    setErrorMsg('');

    try {
      await reportService.downloadReport(
        report
      );

      setSuccessMsg(
        `Report "${report.name}" downloaded successfully.`
      );

      setTimeout(
        () => setSuccessMsg(''),
        4000
      );

    } catch (err) {
      console.error(
        'Report download failed:',
        err
      );

      setErrorMsg(
        'Unable to download the report file.'
      );

      setTimeout(
        () => setErrorMsg(''),
        4000
      );
    }
  };


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
            Security Reports
          </h2>

          <p className="small text-muted mb-0">
            Generate and download security log analysis reports
          </p>

        </div>


        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() =>
            setShowGenerateModal(true)
          }
        >
          Generate New Report
        </Button>

      </div>


      {/* -----------------------------------------------------
          Messages
      ----------------------------------------------------- */}

      {successMsg && (
        <AlertBanner
          type="success"
          message={successMsg}
          onClose={() =>
            setSuccessMsg('')
          }
        />
      )}


      {errorMsg && (
        <AlertBanner
          type="danger"
          message={errorMsg}
          onClose={() =>
            setErrorMsg('')
          }
        />
      )}


      {/* -----------------------------------------------------
          Report Summary
      ----------------------------------------------------- */}

      <div className="row g-3">


        {/* Generated Reports */}

        <div className="col-12 col-md-4">

          <div className="soc-card p-4">

            <span className="small text-muted d-block font-monospace">
              GENERATED REPORTS
            </span>

            <h3 className="fw-bold text-bright mb-0">
              {reports.length}
            </h3>

          </div>

        </div>


        {/* Telemetry */}

        <div className="col-12 col-md-4">

          <div className="soc-card p-4">

            <span className="small text-muted d-block font-monospace">
              AUDITED LOG EVENTS
            </span>

            <h3 className="fw-bold text-cyan mb-0">
              {totalTelemetry.toLocaleString()}
            </h3>

          </div>

        </div>


        {/* Monitoring status */}

        <div className="col-12 col-md-4">

          <div className="soc-card p-4">

            <span className="small text-muted d-block font-monospace">
              TELEMETRY STATUS
            </span>

            <h3
              className={`fw-bold mb-0 ${
                totalTelemetry > 0
                  ? 'text-success'
                  : 'text-muted'
              }`}
            >
              {totalTelemetry > 0
                ? 'Monitoring Active'
                : 'No Telemetry'}
            </h3>

          </div>

        </div>

      </div>


      {/* -----------------------------------------------------
          Report Archive
      ----------------------------------------------------- */}

      <div className="soc-card p-4">

        <div className="d-flex align-items-center justify-content-between mb-3">

          <div>

            <h5 className="fw-bold text-bright mb-1">
              Report Archives & Downloads
            </h5>

            <p className="small text-muted mb-0">
              Download generated PDF reports or CSV security data
            </p>

          </div>

        </div>


        {loading ? (

          <Loader
            text="Loading Security Reports..."
          />

        ) : reports.length === 0 ? (

          <div className="text-center py-5">

            <FiFileText
              size={48}
              className="text-cyan mb-3"
            />

            <h5 className="fw-bold text-bright">
              No Reports Generated
            </h5>

            <p className="small text-muted mb-3">
              Generate a security report to create the first report archive.
            </p>

            <Button
              variant="primary"
              icon={FiPlus}
              onClick={() =>
                setShowGenerateModal(true)
              }
            >
              Generate Report
            </Button>

          </div>

        ) : (

          <div className="soc-table-container">

            <table className="soc-table">

              <thead>

                <tr>

                  <th>
                    Report Name
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Generated At
                  </th>

                  <th>
                    Format
                  </th>

                  <th>
                    File Size
                  </th>

                  <th>
                    Status
                  </th>

                  <th className="text-end">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports.map((report) => {

                  const format =
                    String(
                      report.format ?? ''
                    ).toUpperCase();

                  const status =
                    String(
                      report.status ?? ''
                    ).toUpperCase();

                  const canDownload =
                    status === 'COMPLETED' &&
                    Boolean(report.fileUrl);

                  return (

                    <tr
                      key={report.id}
                    >

                      {/* Report name */}

                      <td>

                        <div className="d-flex align-items-center gap-2">

                          <FiFileText
                            className="text-cyan flex-shrink-0"
                            size={18}
                          />

                          <div>

                            <span className="fw-semibold text-bright d-block">
                              {report.name}
                            </span>

                            <span className="small text-muted font-monospace">
                              {report.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* Type */}

                      <td className="small text-muted">
                        {report.type}
                      </td>


                      {/* Generated */}

                      <td className="font-monospace text-muted small">
                        {report.generatedAt}
                      </td>


                      {/* Format */}

                      <td>

                        <span className="soc-badge soc-badge-low font-monospace">
                          {format}
                        </span>

                      </td>


                      {/* Size */}

                      <td className="font-monospace text-muted">
                        {report.size || '—'}
                      </td>


                      {/* Status */}

                      <td>

                        <span
                          className={`soc-badge ${getStatusBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>


                      {/* Actions */}

                      <td className="text-end">

                        {canDownload ? (

                          <Button
                            variant="outline"
                            size="sm"
                            icon={FiDownload}
                            onClick={() =>
                              handleDownload(
                                report
                              )
                            }
                          >
                            {format}
                          </Button>

                        ) : (

                          <span className="small text-muted">
                            Not available
                          </span>

                        )}

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* -----------------------------------------------------
          Generate Report Modal
      ----------------------------------------------------- */}

      <Modal
        isOpen={showGenerateModal}
        onClose={() =>
          setShowGenerateModal(false)
        }

        title="Generate Security Report"

        footer={

          <div className="d-flex justify-content-end gap-2 w-100">

            <Button
              variant="outline"
              onClick={() =>
                setShowGenerateModal(false)
              }
            >
              Cancel
            </Button>


            <Button
              variant="primary"
              isLoading={generating}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>

          </div>

        }
      >

        <form
          onSubmit={handleGenerateReport}
        >


          {/* Report title */}

          <div className="mb-3">

            <label className="form-label text-muted small fw-semibold">
              Report Title
            </label>

            <input
              type="text"
              className="form-control soc-input"
              value={reportTitle}
              onChange={(e) =>
                setReportTitle(
                  e.target.value
                )
              }
              required
            />

          </div>


          {/* Type and format */}

          <div className="row g-3 mb-3">


            <div className="col-12 col-md-6">

              <label className="form-label text-muted small fw-semibold">
                Report Type
              </label>

              <select
                className="form-select soc-input"
                value={reportType}
                onChange={(e) =>
                  setReportType(
                    e.target.value
                  )
                }
              >

                <option value="Security Threat Analysis">
                  Security Threat Analysis
                </option>

                <option value="Security Audit">
                  Security Audit
                </option>

                <option value="Incident Summary">
                  Incident Summary
                </option>

                <option value="Threat Detection Analysis">
                  Threat Detection Analysis
                </option>

              </select>

            </div>


            <div className="col-12 col-md-6">

              <label className="form-label text-muted small fw-semibold">
                Export Format
              </label>

              <select
                className="form-select soc-input"
                value={reportFormat}
                onChange={(e) =>
                  setReportFormat(
                    e.target.value
                  )
                }
              >

                <option value="PDF">
                  PDF Document
                </option>

                <option value="CSV">
                  CSV Spreadsheet
                </option>

              </select>

            </div>

          </div>


          {/* Date range */}

          <div className="mb-3">

            <label className="form-label text-muted small fw-semibold">
              Analysis Time Window
            </label>

            <select
              className="form-select soc-input"
              value={dateRange}
              onChange={(e) =>
                setDateRange(
                  e.target.value
                )
              }
            >

              <option value="Last 24 Hours">
                Last 24 Hours
              </option>

              <option value="Last 7 Days">
                Last 7 Days
              </option>

              <option value="Last 30 Days">
                Last 30 Days
              </option>

              <option value="Current Quarter">
                Current Quarter
              </option>

            </select>

          </div>


        </form>

      </Modal>

    </div>
  );
};