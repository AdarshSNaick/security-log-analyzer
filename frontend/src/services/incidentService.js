import api from './api';

const normalizeIncident = (incident) => ({
  ...incident,

  affectedAsset:
    incident.affectedAsset ??
    incident.affected_asset ??
    'Security Log Analyzer Host',

  sourceIp:
    incident.sourceIp ??
    incident.source_ip ??
    'Unknown',

  detectedAt:
    incident.detectedAt ??
    incident.detected_at ??
    incident.createdAt ??
    incident.created_at ??
    '',

  status: String(incident.status ?? '').toUpperCase(),

  timeline: incident.timeline ?? [],

  suggestedActions: incident.suggestedActions ?? [],
});

export const incidentService = {
  getIncidents: async () => {
    const response = await api.get('/incidents/');

    const data = Array.isArray(response.data)
      ? response.data
      : response.data.results ?? [];

    return data.map(normalizeIncident);
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(
      `/incidents/${id}/`,
      {
        status: status.toUpperCase(),
      }
    );

    return normalizeIncident(response.data);
  },
};