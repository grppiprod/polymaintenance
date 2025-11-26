import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser } = useData();
  const { user: currentUser } = useAuth();
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.PRODUCTION);

  if (currentUser?.role !== UserRole.ADMIN) {
    return <div className="text-red-500 p-8">Access Denied. Admin only.</div>;
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    
    addUser({
      username: newUsername,
      password: newPassword,
      role: newRole
    });
    setNewUsername('');
    setNewPassword('');
    setNewRole(UserRole.PRODUCTION);
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-in">
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create User Form */}
        <div className="bg-poly-card border border-gray-800 p-6 rounded-xl shadow-lg h-fit">
          <h3 className="text-lg font-bold text-poly-primary mb-4">Add New User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input 
                type="text" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)}
                className="w-full bg-poly-dark border border-gray-700 rounded p-2 text-white focus:border-poly-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-poly-dark border border-gray-700 rounded p-2 text-white focus:border-poly-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select 
                value={newRole} 
                onChange={e => setNewRole(e.target.value as UserRole)}
                className="w-full bg-poly-dark border border-gray-700 rounded p-2 text-white focus:border-poly-primary focus:outline-none"
              >
                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-poly-primary hover:bg-poly-primaryHover text-white font-bold py-2 rounded mt-2">
              Create User
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Existing Users</h3>
          {users.map(u => (
            <div key={u.id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center border border-gray-700">
              <div>
                <p className="font-bold text-white">{u.username}</p>
                <p className="text-xs text-poly-muted">{u.role}</p>
              </div>
              {u.id !== currentUser.id && ( // Prevent deleting self
                <button 
                  onClick={() => deleteUser(u.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};