import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ page, label, icon }: { page: string; label: string; icon: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 
        ${activePage === page 
          ? 'bg-poly-primary/20 text-poly-primary border-r-4 border-poly-primary' 
          : 'text-poly-muted hover:bg-poly-card hover:text-white'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-poly-darker overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full z-20 bg-poly-card border-b border-gray-800 p-4 flex justify-between items-center no-print">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded bg-poly-primary flex items-center justify-center">P</span>
          PolyMaint
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-black/80 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-20 w-64 h-full bg-poly-dark border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out no-print
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-poly-primary flex items-center justify-center text-white">P</div>
             PolyMaint
          </h1>
          <p className="text-xs text-poly-muted mt-2">Repairs & Maintenance</p>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          <NavItem page="dashboard" label="Dashboard" icon="📊" />
          <NavItem page="tickets" label="Logs Board" icon="📋" />
          {user?.role === UserRole.ADMIN && (
            <NavItem page="users" label="User Management" icon="👥" />
          )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-poly-card/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-poly-primary flex items-center justify-center font-bold text-white">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-poly-muted truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full py-2 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded transition-colors text-sm font-semibold"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0 relative bg-poly-darker">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {children}
        </div>
      </main>
    </div>
  );
};