import api from './api';

const normalizeReport = (report) => ({
  ...report,

  id: report.id,
  name: report.name,
  type: report.type ?? report.report_type ?? 'Security Report',

  generatedAt:
    report.generatedAt ??
    report.generated_at ??
    '',

  format: String(
    report.format ?? 'PDF'
  ).toUpperCase(),

  size:
    report.size ??
    report.file_size ??
    '0 KB',

  status:
    report.status ??
    'COMPLETED',

  totalEventsProcessed:
    report.totalEventsProcessed ??
    report.total_events_processed ??
    0,

  threatsBlocked:
    report.threatsBlocked ??
    report.threats_detected ??
    0,

  fileUrl:
    report.fileUrl ??
    report.file_url ??
    null,
});

export const reportService = {
  getReports: async () => {
    const response = await api.get('/reports/');

    const data = Array.isArray(response.data)
      ? response.data
      : response.data.results ?? [];

    return data.map(normalizeReport);
  },

  generateReport: async (reportConfig) => {
    const response = await api.post(
      '/reports/generate/',
      reportConfig
    );

    return normalizeReport(response.data);
  },

  downloadReport: async (report) => {
    const response = await api.get(
      `/reports/${report.id}/download/`,
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data]);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    const extension =
      report.format.toLowerCase();

    link.download =
      `${report.id}_${report.name
        .replace(/[^a-z0-9_\-]/gi, '_')}.${extension}`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  },
};