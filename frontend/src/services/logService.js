import api from './api';

export const logService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },

  getLogs: async (filters = {}) => {
    const response = await api.get('/logs/', {
      params: filters,
    });

    return response.data;
  },

  getLogFiles: async () => {
  const response = await api.get('/logs/files/');
  return response.data;
  },

  uploadLogFile: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        '/logs/upload/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) /
                  progressEvent.total
              );

              onProgress(percentCompleted);
            }
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        'Log upload API is not available:',
        error
      );

      throw error;
    }
  },

  deleteLog: async (id) => {
    const response = await api.delete(
      `/logs/${id}/`
    );

    return response.data;
  },
};