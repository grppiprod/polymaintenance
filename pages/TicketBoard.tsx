import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { TicketType, TicketStatus, PriorityLevel, UserRole } from '../types';
import { TicketCard } from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';

interface TicketBoardProps {
  onSelectTicket: (id: string) => void;
  onNewTicket: () => void;
}

export const TicketBoard: React.FC<TicketBoardProps> = ({ onSelectTicket, onNewTicket }) => {
  const { tickets } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TicketType>(TicketType.REPAIR);
  const [statusFilter, setStatusFilter] = useState<TicketStatus>(TicketStatus.ACTIVE);
  const [search, setSearch] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(t => t.type === activeTab)
      .filter(t => t.status === statusFilter)
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime()); // Newest first
  }, [tickets, activeTab, statusFilter, search]);

  const stats = useMemo(() => {
      const activeRepairs = tickets.filter(t => t.type === TicketType.REPAIR && t.status === TicketStatus.ACTIVE).length;
      const activePM = tickets.filter(t => t.type === TicketType.PM && t.status === TicketStatus.ACTIVE).length;
      return { activeRepairs, activePM };
  }, [tickets]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 bg-poly-darker/95 backdrop-blur z-10 py-4 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white">Logs Board</h2>
        
        <button
          onClick={onNewTicket}
          className="bg-poly-primary hover:bg-poly-primaryHover text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-orange-900/20 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> New Log
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Type Tabs */}
        <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab(TicketType.REPAIR)}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all relative ${
              activeTab === TicketType.REPAIR 
                ? 'bg-red-500/20 text-red-400 shadow-inner' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Repairs
            {stats.activeRepairs > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{stats.activeRepairs}</span>}
          </button>
          <button
            onClick={() => setActiveTab(TicketType.PM)}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === TicketType.PM 
                ? 'bg-blue-500/20 text-blue-400 shadow-inner' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Preventive Maintenance
             {stats.activePM > 0 && <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 rounded-full">{stats.activePM}</span>}
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex gap-2">
            <button 
                onClick={() => setStatusFilter(TicketStatus.ACTIVE)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${statusFilter === TicketStatus.ACTIVE ? 'bg-poly-primary text-white border-poly-primary' : 'bg-transparent text-gray-400 border-gray-700'}`}
            >
                Active
            </button>
            <button 
                onClick={() => setStatusFilter(TicketStatus.CLOSED)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${statusFilter === TicketStatus.CLOSED ? 'bg-green-600 text-white border-green-600' : 'bg-transparent text-gray-400 border-gray-700'}`}
            >
                Closed
            </button>
           </div>
           
           <input
             type="text"
             placeholder="Search logs..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full md:w-64 bg-poly-card border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-poly-primary focus:outline-none"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={() => onSelectTicket(ticket.id)} />
        ))}
        {filteredTickets.length === 0 && (
          <div className="col-span-full text-center py-20 text-poly-muted">
            <p className="text-xl">No logs found.</p>
            <p className="text-sm mt-2">Try changing the filters or create a new log.</p>
          </div>
        )}
      </div>
    </div>
  );
};