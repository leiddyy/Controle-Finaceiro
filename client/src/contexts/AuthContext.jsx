import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const token = localStorage.getItem('meu_financeiro_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          localStorage.removeItem('meu_financeiro_token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('meu_financeiro_token', token);
    setUser(user);
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem('meu_financeiro_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('meu_financeiro_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
