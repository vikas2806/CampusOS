import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, clubService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('campusos_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campusos_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user and club info from server
  const loadProfile = useCallback(async () => {
    const savedToken = localStorage.getItem('campusos_token');
    if (!savedToken) {
      setUser(null);
      setClub(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('campusos_user', JSON.stringify(data.user));

        // Fetch club details if user has a club
        try {
          const clubRes = await clubService.getMyClub();
          if (clubRes?.data?.club) {
            setClub(clubRes.data.club);
          }
        } catch {
          // user might not have a club yet
          setClub(null);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // If unauthorized, clear saved auth
      if (err.response?.status === 401) {
        localStorage.removeItem('campusos_token');
        localStorage.removeItem('campusos_user');
        setToken(null);
        setUser(null);
        setClub(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Login handler
  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    if (data?.token && data?.user) {
      localStorage.setItem('campusos_token', data.token);
      localStorage.setItem('campusos_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      // fetch club details
      try {
        const clubRes = await clubService.getMyClub();
        if (clubRes?.data?.club) {
          setClub(clubRes.data.club);
        }
      } catch {
        setClub(null);
      }

      return data.user;
    }
    throw new Error('Invalid login response from server');
  };

  // Register handler
  const register = async (payload) => {
    const { data } = await authService.register(payload);
    if (data?.token && data?.user) {
      localStorage.setItem('campusos_token', data.token);
      localStorage.setItem('campusos_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      if (data.club) setClub(data.club);
      return data.user;
    }
    throw new Error('Invalid register response from server');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('campusos_token');
    localStorage.removeItem('campusos_user');
    setToken(null);
    setUser(null);
    setClub(null);
  };

  const value = {
    token,
    user: user ? { ...user, club: club || user.club } : null,
    club,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshProfile: loadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
