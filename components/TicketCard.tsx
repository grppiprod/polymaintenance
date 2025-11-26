import React from 'react';
import { Ticket, PriorityLevel, TicketStatus } from '../types';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const priorityColors = {
    [PriorityLevel.LOW]: 'bg-green-900/30 text-green-400 border-green-800',
    [PriorityLevel.MEDIUM]: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    [PriorityLevel.HIGH]: 'bg-orange-900/30 text-orange-400 border-orange-800',
    [PriorityLevel.CRITICAL]: 'bg-red-900/30 text-red-400 border-red-800 animate-pulse',
  };

  const statusColor = ticket.status === TicketStatus.ACTIVE ? 'text-blue-400' : 'text-gray-500';

  return (
    <div 
      onClick={onClick}
      className="group bg-poly-card hover:bg-zinc-700/80 border border-gray-800 rounded-lg p-5 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col gap-3 animate-slide-in"
    >
      <div className="flex justify-between items-start">
        <span className={`px-2 py-1 rounded text-xs font-bold border ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className={`text-xs font-medium flex items-center gap-1 ${statusColor}`}>
          <div className={`w-2 h-2 rounded-full ${ticket.status === TicketStatus.ACTIVE ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
          {ticket.status}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white group-hover:text-poly-primary transition-colors line-clamp-2">
          {ticket.title}
        </h3>
        <p className="text-sm text-poly-muted mt-1 line-clamp-3">
          {ticket.description}
        </p>
      </div>

      {ticket.imageUrl && (
        <div className="mt-2 h-32 w-full rounded-md overflow-hidden bg-black/50">
          <img src={ticket.imageUrl} alt="Attachment" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      <div className="mt-auto pt-4 flex justify-between items-end border-t border-gray-700/50">
        <div className="text-xs text-poly-muted">
          <p>By: <span className="text-gray-300">{ticket.createdByName}</span></p>
          <p className="mt-0.5 opacity-70">{new Date(ticket.dateReported).toLocaleDateString()}</p>
        </div>
        <div className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
           {ticket.type}
        </div>
      </div>
    </div>
  );
};