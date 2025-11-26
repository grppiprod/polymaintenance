import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. (Hint: admin/1234)');
    }
  };

  return (
    <div className="min-h-screen bg-poly-darker flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-poly-card border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-poly-primary p-6 text-center">
          <h1 className="text-3xl font-bold text-white tracking-wide">PolyMaint</h1>
          <p className="text-orange-100 opacity-90 mt-2">Repair & Maintenance Tracking</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-poly-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-poly-primary focus:ring-1 focus:ring-poly-primary transition-all"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-poly-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-poly-primary focus:ring-1 focus:ring-poly-primary transition-all"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-poly-primary hover:bg-poly-primaryHover text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            Sign In
          </button>

          <div className="text-center text-xs text-poly-muted mt-4">
            <p>Demo Credentials:</p>
            <p>Admin: admin / 1234</p>
            <p>Production: prod_lead / password</p>
            <p>Engineering: eng_chief / password</p>
          </div>
        </form>
      </div>
    </div>
  );
};