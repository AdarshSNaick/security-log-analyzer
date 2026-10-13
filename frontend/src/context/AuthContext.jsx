import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        try {
          // Verify the token and get the current Django user
          const currentUser = await authService.getProfile();
          setUser(currentUser);
        } catch (error) {
          // Token is no longer valid
          localStorage.removeItem('soc_auth_token');
          localStorage.removeItem('soc_user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);

    try {
      const data = await authService.login(username, password);

      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUserProfile = async (updatedData) => {
    /*
     * Profile editing will be connected to the Django
     * backend when we build the profile/settings API.
     *
     * For now, update the local user state.
     */
    const updatedUser = {
      ...user,
      ...updatedData,
    };

    setUser(updatedUser);

    localStorage.setItem(
      'soc_user',
      JSON.stringify(updatedUser)
    );

    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};