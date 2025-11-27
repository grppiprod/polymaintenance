
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '../types';
import { API_URL, API_TIMEOUT } from '../config';

interface AuthContextType extends AuthState {
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [isOffline, setIsOffline] = useState(false);

  // Check local storage for persisted session token
  useEffect(() => {
    const session = localStorage.getItem('poly_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setAuthState({
          user: parsed.user,
          isAuthenticated: true,
        });
        if (parsed.isOffline) {
          setIsOffline(true);
        }
      } catch (e) {
        localStorage.removeItem('poly_session');
      }
    }
  }, []);

  const login = async (username: string, password?: string): Promise<boolean> => {
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), API_TIMEOUT)
      );

      const fetchPromise = fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      // Race between fetch and timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (res.ok) {
        const data = await res.json();
        const user = { ...data.user, id: data.user._id }; 
        
        setAuthState({ user, isAuthenticated: true });
        localStorage.setItem('poly_session', JSON.stringify({ user, token: data.token }));
        setIsOffline(false);
        window.location.reload(); 
        return true;
      }
      return false;
    } catch (error) {
      console.warn("Backend unreachable, switching to Offline Demo Mode");
      
      // FALLBACK MOCK LOGIN FOR DEMO/PREVIEW
      // In a real MERN app, you might not want this, but it's essential for the preview
      // or for offline-first capabilities.
      let mockUser: User | null = null;
      
      if (username === 'admin' && password === '1234') {
        mockUser = { id: 'admin-1', username: 'admin', role: UserRole.ADMIN };
      } else if (username === 'prod_lead' && password === 'password') {
        mockUser = { id: 'prod-1', username: 'prod_lead', role: UserRole.PRODUCTION };
      } else if (username === 'eng_chief' && password === 'password') {
        mockUser = { id: 'eng-1', username: 'eng_chief', role: UserRole.ENGINEERING };
      }

      if (mockUser) {
        setAuthState({ user: mockUser, isAuthenticated: true });
        setIsOffline(true);
        localStorage.setItem('poly_session', JSON.stringify({ user: mockUser, token: 'mock-token', isOffline: true }));
        window.location.reload();
        return true;
      }

      return false;
    }
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('poly_session');
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, isOffline }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
