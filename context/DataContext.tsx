
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, User, HistoryLog, UserRole } from '../types';
import { API_URL } from '../config';

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

interface DataProviderProps {
  children: ReactNode;
  isOffline: boolean;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, isOffline }) => {
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

  // --- LOCAL STORAGE HELPERS (Fallback) ---
  const loadLocalTickets = () => {
    const saved = localStorage.getItem('poly_tickets');
    return saved ? JSON.parse(saved) : [];
  };
  const saveLocalTickets = (newTickets: Ticket[]) => {
    localStorage.setItem('poly_tickets', JSON.stringify(newTickets));
    setTickets(newTickets);
  };
  const loadLocalUsers = () => {
    const saved = localStorage.getItem('poly_users');
    // Default users if empty
    if (!saved) {
      const defaults = [
        { id: 'admin-1', username: 'admin', role: UserRole.ADMIN },
        { id: 'prod-1', username: 'prod_lead', role: UserRole.PRODUCTION },
        { id: 'eng-1', username: 'eng_chief', role: UserRole.ENGINEERING },
      ];
      localStorage.setItem('poly_users', JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  };
  const saveLocalUsers = (newUsers: User[]) => {
    localStorage.setItem('poly_users', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const fetchData = async () => {
    setLoading(true);
    
    // If Auth Context determined we are offline, skip fetch
    if (isOffline) {
      console.log("Running in Offline/Demo Mode");
      setTickets(loadLocalTickets());
      setUsers(loadLocalUsers());
      setLoading(false);
      return;
    }

    try {
      const [ticketsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/tickets`, { headers: getHeaders() }),
        fetch(`${API_URL}/users`, { headers: getHeaders() })
      ]);

      if (ticketsRes.ok && usersRes.ok) {
        const ticketData = await ticketsRes.json();
        setTickets(ticketData.map((t: any) => ({ ...t, id: t._id })));
        
        const userData = await usersRes.json();
        setUsers(userData.map((u: any) => ({ ...u, id: u._id })));
      } else {
        throw new Error("Backend returned error");
      }
    } catch (err) {
      console.warn("Failed to connect to backend. Falling back to local demo data.", err);
      // Fallback to local storage
      setTickets(loadLocalTickets());
      setUsers(loadLocalUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  // --- CRUD OPERATIONS (Hybrid: Try API -> Catch -> Local) ---

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'history'>) => {
    const newId = Date.now().toString(); // Fallback ID
    
    if (isOffline) {
       const newTicket = { ...ticketData, id: newId, history: [] };
       saveLocalTickets([newTicket, ...tickets]);
       return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(ticketData),
      });
      if (res.ok) {
        const newTicket = await res.json();
        setTickets(prev => [{ ...newTicket, id: newTicket._id }, ...prev]);
      } else throw new Error();
    } catch (err) {
       // Fallback
       const newTicket = { ...ticketData, id: newId, history: [] };
       saveLocalTickets([newTicket, ...tickets]);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    if (isOffline) {
      const newTickets = tickets.map(t => t.id === id ? { ...t, ...updates } : t);
      saveLocalTickets(newTickets);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? { ...updated, id: updated._id } : t));
      } else throw new Error();
    } catch (err) {
      const newTickets = tickets.map(t => t.id === id ? { ...t, ...updates } : t);
      saveLocalTickets(newTickets);
    }
  };

  const deleteTicket = async (id: string) => {
    if (isOffline) {
        saveLocalTickets(tickets.filter(t => t.id !== id));
        return;
    }

    try {
      await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
        saveLocalTickets(tickets.filter(t => t.id !== id));
    }
  };

  const addHistoryLog = async (ticketId: string, logData: Omit<HistoryLog, 'id'>) => {
    if (isOffline) {
        const newLog = { ...logData, id: Date.now().toString() };
        const newTickets = tickets.map(t => 
            t.id === ticketId ? { ...t, history: [...t.history, newLog] } : t
        );
        saveLocalTickets(newTickets);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/history`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...updatedTicket, id: updatedTicket._id } : t));
      } else throw new Error();
    } catch (err) {
        const newLog = { ...logData, id: Date.now().toString() };
        const newTickets = tickets.map(t => 
            t.id === ticketId ? { ...t, history: [...t.history, newLog] } : t
        );
        saveLocalTickets(newTickets);
    }
  };

  const deleteHistoryLog = async (ticketId: string, logId: string) => {
    if(isOffline) {
        const newTickets = tickets.map(t => 
            t.id === ticketId ? { ...t, history: t.history.filter(h => h.id !== logId) } : t
        );
        saveLocalTickets(newTickets);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/history/${logId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...updatedTicket, id: updatedTicket._id } : t));
      } else throw new Error();
    } catch (err) {
        const newTickets = tickets.map(t => 
            t.id === ticketId ? { ...t, history: t.history.filter(h => h.id !== logId) } : t
        );
        saveLocalTickets(newTickets);
    }
  };

  const updateHistoryLog = async (ticketId: string, logId: string, description: string) => {
    if(isOffline) {
        const newTickets = tickets.map(t => 
            t.id === ticketId ? { 
                ...t, 
                history: t.history.map(h => h.id === logId ? { ...h, description } : h) 
            } : t
        );
        saveLocalTickets(newTickets);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/history/${logId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...updatedTicket, id: updatedTicket._id } : t));
      } else throw new Error();
    } catch (err) {
        const newTickets = tickets.map(t => 
            t.id === ticketId ? { 
                ...t, 
                history: t.history.map(h => h.id === logId ? { ...h, description } : h) 
            } : t
        );
        saveLocalTickets(newTickets);
    }
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    if (isOffline) {
        const newUser = { ...userData, id: Date.now().toString() };
        saveLocalUsers([...users, newUser]);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [...prev, { ...newUser, id: newUser._id }]);
      } else throw new Error();
    } catch (err) {
        const newUser = { ...userData, id: Date.now().toString() };
        saveLocalUsers([...users, newUser]);
    }
  };

  const deleteUser = async (id: string) => {
    if (isOffline) {
        saveLocalUsers(users.filter(u => u.id !== id));
        return;
    }

    try {
      await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
        saveLocalUsers(users.filter(u => u.id !== id));
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
