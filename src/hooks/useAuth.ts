import { useState, useEffect } from 'react';
import { apiClient } from '../api';

export interface AuthState {
  token: string | null;
  user: { email: string,
    name: string,
    surname: string
   } | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    loading: false,
  });

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await apiClient.login(email, password);
      
      localStorage.setItem('token', response.access_token);

      const profile = await apiClient.getUserByEmail(email);

      localStorage.setItem('user', JSON.stringify(profile));
      
      setAuthState({
        token: response.access_token,
        user:profile,
        loading: false,
      });
      
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      token: null,
      user: null,
      loading: false,
    });
  };

  const isAuthenticated = !!authState.token;

  return {
    ...authState,
    login,
    logout,
    isAuthenticated,
  };
}