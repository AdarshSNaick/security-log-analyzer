import api from './api';

export const alertService = {
  getAlerts: async (filters = {}) => {
    const response = await api.get('/alerts/', {
      params: filters,
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data.results ?? [];

    return data;
  },

  resolveAlert: async (id) => {
    const response = await api.patch(
      `/alerts/${id}/resolve/`
    );

    return response.data;
  },
};