
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, User, HistoryLog } from '../types';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

interface DataContextType {
  tickets: Ticket[];
  users: User[];
  loading: boolean;
  error: string | null;
  addTicket: (ticket: Omit<Ticket, 'id' | 'history'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addHistoryLog: (ticketId: string, log: Omit<HistoryLog, 'id'>) => Promise<void>;
  deleteHistoryLog: (ticketId: string, logId: string) => Promise<void>;
  updateHistoryLog: (ticketId: string, logId: string, description: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to add Authorization header
  const getHeaders = () => {
    const session = localStorage.getItem('poly_session');
    const token = session ? JSON.parse(session).token : '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/tickets`, { headers: getHeaders() }),
        fetch(`${API_URL}/users`, { headers: getHeaders() })
      ]);

      if (ticketsRes.ok) {
        const ticketData = await ticketsRes.json();
        // Map _id to id for frontend compatibility
        setTickets(ticketData.map((t: any) => ({ ...t, id: t._id })));
      }
      
      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.map((u: any) => ({ ...u, id: u._id })));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Failed to connect to server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'history'>) => {
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(ticketData),
      });
      if (res.ok) {
        const newTicket = await res.json();
        setTickets(prev => [{ ...newTicket, id: newTicket._id }, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? { ...updated, id: updated._id } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addHistoryLog = async (ticketId: string, logData: Omit<HistoryLog, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...updatedTicket, id: updatedTicket._id } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHistoryLog = async (ticketId: string, logId: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/history/${logId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...updatedTicket, id: updatedTicket._id } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateHistoryLog = async (ticketId: string, logId: string, description: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/history/${logId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...updatedTicket, id: updatedTicket._id } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [...prev, { ...newUser, id: newUser._id }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DataContext.Provider value={{
      tickets, users, loading, error,
      addTicket, updateTicket, deleteTicket,
      addHistoryLog, deleteHistoryLog, updateHistoryLog,
      addUser, deleteUser
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
