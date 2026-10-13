import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiDownload,
  FiArrowRight,
} from 'react-icons/fi';

import { logService } from '../services/logService';
import { Button } from '../components/Buttons/Button';
import { AlertBanner } from '../components/Alerts/AlertBanner';


export const UploadLogs = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [uploadedFilesHistory, setUploadedFilesHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);


  // ==========================================================
  // LOAD REAL INGESTION HISTORY
  // ==========================================================

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);

      const data = await logService.getLogFiles();

      setUploadedFilesHistory(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        'Failed to load ingestion history:',
        error
      );

      setErrorMsg(
        'Unable to load ingestion history from the server.'
      );

    } finally {
      setLoadingHistory(false);
    }
  };


  // ==========================================================
  // LOAD HISTORY WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {
    loadHistory();
  }, []);


  // ==========================================================
  // DRAG HANDLING
  // ==========================================================

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.type === 'dragenter' ||
      e.type === 'dragover'
    ) {
      setDragActive(true);

    } else if (
      e.type === 'dragleave'
    ) {
      setDragActive(false);
    }
  };


  // ==========================================================
  // FILE VALIDATION
  // ==========================================================

  const validateFile = (file) => {
    const validExtensions = [
      '.log',
      '.txt',
      '.csv',
    ];

    const fileName = file.name.toLowerCase();

    const isValid = validExtensions.some(
      (ext) => fileName.endsWith(ext)
    );

    if (!isValid) {
      setErrorMsg(
        'Invalid file format. Only .log, .txt, and .csv files are supported.'
      );

      setSelectedFile(null);

      return false;
    }

    // Backend currently allows 10 MB.
    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setErrorMsg(
        'File size must not exceed 10 MB.'
      );

      setSelectedFile(null);

      return false;
    }

    setErrorMsg('');

    return true;
  };


  // ==========================================================
  // DRAG & DROP
  // ==========================================================

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      const file = e.dataTransfer.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };


  // ==========================================================
  // FILE SELECT
  // ==========================================================

  const handleFileSelect = (e) => {
    if (
      e.target.files &&
      e.target.files[0]
    ) {
      const file = e.target.files[0];

      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };


  // ==========================================================
  // UPLOAD
  // ==========================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setUploading(true);
    setProgress(10);

    setSuccessMsg('');
    setErrorMsg('');

    let interval;

    try {

      // ------------------------------------------------------
      // Visual progress while the request is processing
      // ------------------------------------------------------

      interval = setInterval(() => {
        setProgress((prev) => {

          if (prev >= 90) {
            return 90;
          }

          return prev + 10;
        });

      }, 300);


      // ------------------------------------------------------
      // Send file to real Django backend
      // ------------------------------------------------------

      const response = await logService.uploadLogFile(
        selectedFile,
        (percent) => setProgress(percent)
      );


      if (interval) {
        clearInterval(interval);
      }

      setProgress(100);


      // ------------------------------------------------------
      // Success message
      // ------------------------------------------------------

      setSuccessMsg(
        response.message ||
        `File ${selectedFile.name} uploaded and parsed successfully!`
      );


      // ------------------------------------------------------
      // Clear selected file
      // ------------------------------------------------------

      setSelectedFile(null);


      // ------------------------------------------------------
      // IMPORTANT:
      // Reload ingestion history from MariaDB.
      // Do NOT manually add fake frontend data.
      // ------------------------------------------------------

      await loadHistory();

    } catch (error) {

      if (interval) {
        clearInterval(interval);
      }

      console.error(
        'Log upload failed:',
        error
      );

      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.details;

      setErrorMsg(
        serverMessage ||
        error?.message ||
        'Failed to upload log file. Please check server connectivity.'
      );

    } finally {

      setUploading(false);
    }
  };


  // ==========================================================
  // DOWNLOAD SAMPLE LOG
  // ==========================================================

  const downloadSampleLog = () => {

    const sampleContent = `2026-07-30 21:45:12|185.220.101.44|admin|SUSPICIOUS_REQUEST|WAF SQL Injection attempt: SELECT * FROM users WHERE 1=1
2026-07-30 21:42:08|10.0.4.12|johndoe|LOGIN_SUCCESS|User login success 2FA verified
2026-07-30 21:30:19|192.168.1.105|admin|LOGIN_FAILED|Failed SSH password attempt
2026-07-30 21:25:40|172.16.0.44|sarah_admin|UNAUTHORIZED_ACCESS|Sudo privilege escalation denied
2026-07-30 21:18:11|45.33.32.156|scanner|SUSPICIOUS_REQUEST|Rapid TCP port scan across ports 21,22,80,443`;

    const blob = new Blob(
      [sampleContent],
      {
        type: 'text/plain;charset=utf-8;',
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      'sample_cybersecurity_audit.log';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // ==========================================================
  // FORMAT TIMESTAMP
  // ==========================================================

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return '—';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="d-flex flex-column gap-4">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

        <div>
          <h2 className="fw-bold text-bright mb-1">
            Upload Security Log Files
          </h2>

          <p className="small text-muted mb-0">
            Ingest .log, .txt, or .csv server & firewall telemetry into SIEM
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-cyan d-inline-flex align-items-center gap-2"
          onClick={downloadSampleLog}
        >
          <FiDownload size={18} />

          Download Sample Log (.log)
        </button>

      </div>


      {/* ================================================== */}
      {/* MESSAGES */}
      {/* ================================================== */}

      {successMsg && (
        <AlertBanner
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />
      )}

      {errorMsg && (
        <AlertBanner
          type="error"
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />
      )}


      {/* ================================================== */}
      {/* UPLOAD CARD */}
      {/* ================================================== */}

      <div className="soc-card p-4 p-md-5">

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() =>
            fileInputRef.current?.click()
          }

          className={`d-flex flex-column align-items-center justify-content-center p-5 rounded-4 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-cyan bg-dark'
              : 'border-dashed'
          }`}

          style={{
            border: dragActive
              ? '2px dashed var(--soc-cyan)'
              : '2px dashed var(--soc-border-glow)',

            backgroundColor:
              dragActive
                ? 'rgba(0, 242, 254, 0.05)'
                : 'rgba(9, 14, 36, 0.4)',

            cursor: 'pointer',
          }}
        >

          <input
            ref={fileInputRef}
            type="file"
            accept=".log,.txt,.csv"
            onChange={handleFileSelect}
            className="d-none"
          />


          <div
            className="p-3 rounded-circle mb-3 d-flex align-items-center justify-content-center"
            style={{
              background:
                'rgba(0, 242, 254, 0.1)',
              color:
                'var(--soc-cyan)',
            }}
          >
            <FiUploadCloud size={48} />
          </div>


          <h4 className="fw-bold text-bright mb-2">
            Drag and Drop your log file here
          </h4>


          <p
            className="small text-muted mb-3"
            style={{
              maxWidth: '420px',
            }}
          >
            Supports standard system audit logs,
            Apache/Nginx web server access logs,
            WAF payloads, and CSV telemetry exports.
          </p>


          <div className="d-flex align-items-center gap-2 mb-2">

            <span className="soc-badge soc-badge-low">
              .LOG
            </span>

            <span className="soc-badge soc-badge-low">
              .TXT
            </span>

            <span className="soc-badge soc-badge-low">
              .CSV
            </span>

          </div>


          <span className="small text-cyan font-monospace">
            Maximum file size: 10MB
          </span>

        </div>


        {/* ================================================= */}
        {/* SELECTED FILE */}
        {/* ================================================= */}

        {selectedFile && (

          <div className="mt-4 p-3 rounded soc-card bg-dark border border-secondary d-flex align-items-center justify-content-between">

            <div className="d-flex align-items-center gap-3">

              <FiFileText
                size={28}
                className="text-cyan"
              />

              <div>

                <h6 className="fw-bold text-bright mb-0">
                  {selectedFile.name}
                </h6>

                <span className="small text-muted">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </span>

              </div>

            </div>


            <div className="d-flex align-items-center gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                Remove
              </Button>


              <Button
                variant="primary"
                size="sm"
                isLoading={uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
              >
                Start Ingestion
              </Button>

            </div>

          </div>
        )}


        {/* ================================================= */}
        {/* PROGRESS */}
        {/* ================================================= */}

        {uploading && (

          <div className="mt-4">

            <div className="d-flex align-items-center justify-content-between small text-muted mb-1">

              <span>
                Ingesting & Parsing Log Tokens...
              </span>

              <span className="font-monospace text-cyan">
                {progress}%
              </span>

            </div>


            <div
              className="progress bg-dark"
              style={{
                height: '8px',
              }}
            >

              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-cyan"
                role="progressbar"
                style={{
                  width: `${progress}%`,
                  background:
                    'var(--soc-accent-gradient)',
                }}
              />

            </div>

          </div>
        )}

      </div>


      {/* ================================================== */}
      {/* INGESTION HISTORY */}
      {/* ================================================== */}

      <div className="soc-card p-4">

        <div className="d-flex align-items-center justify-content-between mb-3">

          <div>

            <h5 className="fw-bold text-bright mb-1">
              Ingestion History
            </h5>

            <p className="small text-muted mb-0">
              List of uploaded and processed log archives
            </p>

          </div>


          <button
            className="btn btn-sm btn-outline-cyan d-flex align-items-center gap-2"
            onClick={() => navigate('/logs')}
          >
            Go to Log Inspector

            <FiArrowRight size={16} />
          </button>

        </div>


        <div className="soc-table-container">

          <table className="soc-table">

            <thead>

              <tr>

                <th>
                  File Name
                </th>

                <th>
                  File Size
                </th>

                <th>
                  Upload Timestamp
                </th>

                <th>
                  Records Parsed
                </th>

                <th>
                  Ingestion Status
                </th>

              </tr>

            </thead>


            <tbody>

              {/* ========================================== */}
              {/* LOADING */}
              {/* ========================================== */}

              {loadingHistory && (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center text-muted py-4"
                  >
                    Loading ingestion history...
                  </td>

                </tr>

              )}


              {/* ========================================== */}
              {/* EMPTY */}
              {/* ========================================== */}

              {!loadingHistory &&
                uploadedFilesHistory.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center text-muted py-4"
                    >
                      No log files have been uploaded yet.
                    </td>

                  </tr>

                )}


              {/* ========================================== */}
              {/* REAL DATABASE RECORDS */}
              {/* ========================================== */}

              {!loadingHistory &&
                uploadedFilesHistory.map((item) => (

                  <tr key={item.id}>

                    <td className="fw-semibold text-bright d-flex align-items-center gap-2">

                      <FiFileText
                        className="text-cyan"
                      />

                      {item.name}

                    </td>


                    <td className="font-monospace text-muted">

                      {item.size}

                    </td>


                    <td className="font-monospace text-muted small">

                      {formatTimestamp(
                        item.timestamp
                      )}

                    </td>


                    <td className="font-monospace text-cyan fw-bold">

                      +{item.parsedCount} logs

                    </td>


                    <td>

                      <span className="soc-badge soc-badge-success d-inline-flex align-items-center gap-1">

                        <FiCheckCircle
                          size={14}
                        />

                        {item.status}

                      </span>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};