
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '../types';
import { API_URL } from '../config';

interface AuthContextType extends AuthState {
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  // Check local storage for persisted session token
  useEffect(() => {
    const session = localStorage.getItem('poly_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        // In a real app, verify token validity with backend here
        setAuthState({
          user: parsed.user,
          isAuthenticated: true,
        });
      } catch (e) {
        localStorage.removeItem('poly_session');
      }
    }
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const user = { ...data.user, id: data.user._id }; // Map _id to id
        
        setAuthState({ user, isAuthenticated: true });
        localStorage.setItem('poly_session', JSON.stringify({ user, token: data.token }));
        // Reload page to ensure data context refreshes with new token
        window.location.reload(); 
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error", error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('poly_session');
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
