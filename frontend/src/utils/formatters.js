// Formatting utility functions for SOC UI

export const getSeverityBadgeClass = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'soc-badge-critical';
    case 'high':
      return 'soc-badge-high';
    case 'medium':
      return 'soc-badge-medium';
    case 'low':
      return 'soc-badge-low';
    default:
      return 'soc-badge-low';
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'resolved':
    case 'completed':
      return 'soc-badge-success';
    case 'failed':
    case 'blocked':
    case 'critical':
      return 'soc-badge-critical';
    case 'investigating':
    case 'flagged':
    case 'under investigation':
      return 'soc-badge-high';
    case 'open':
      return 'soc-badge-medium';
    default:
      return 'soc-badge-low';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const truncateText = (text, maxLength = 45) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const maskIp = (ip) => {
  if (!ip) return '';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip;
};
