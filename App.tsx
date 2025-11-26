import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { TicketBoard } from './pages/TicketBoard';
import { TicketDetail } from './pages/TicketDetail';
import { UserManagement } from './pages/UserManagement';
import { CreateTicketModal } from './pages/CreateTicketModal';
import { UserRole } from './types';

// Wrapper component to handle protected routes
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedTicketId(null);
  };

  const renderContent = () => {
    if (selectedTicketId) {
      return (
        <TicketDetail 
          ticketId={selectedTicketId} 
          onBack={() => setSelectedTicketId(null)} 
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        // Reuse TicketBoard for now, but in real app this would have charts
        return <TicketBoard onSelectTicket={setSelectedTicketId} onNewTicket={() => setIsModalOpen(true)} />;
      case 'tickets':
        return <TicketBoard onSelectTicket={setSelectedTicketId} onNewTicket={() => setIsModalOpen(true)} />;
      case 'users':
        return user?.role === UserRole.ADMIN ? <UserManagement /> : <div>Access Denied</div>;
      default:
        return <TicketBoard onSelectTicket={setSelectedTicketId} onNewTicket={() => setIsModalOpen(true)} />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
      {isModalOpen && <CreateTicketModal onClose={() => setIsModalOpen(false)} />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DataProvider>
  );
};

export default App;