import api from './api';

const TOKEN_KEY = 'soc_auth_token';
const USER_KEY = 'soc_user';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', {
      username,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return {
      token,
      user,
    };
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');

    const user = response.data;

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );

    return user;
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser: () => {
    const stored = localStorage.getItem(USER_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return Boolean(
      localStorage.getItem(TOKEN_KEY)
    );
  },
};