import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TicketStatus, PriorityLevel, HistoryLog, TicketType } from '../types';
import { analyzeTicket } from '../services/geminiService';

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onBack }) => {
  const { tickets, updateTicket, deleteTicket, addHistoryLog, deleteHistoryLog, updateHistoryLog } = useData();
  const { user } = useAuth();
  const [newLogText, setNewLogText] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const ticket = tickets.find(t => t.id === ticketId);

  useEffect(() => {
    // Reset AI analysis when ticket changes
    setAiAnalysis(null);
  }, [ticketId]);

  if (!ticket || !user) return <div>Log not found</div>;

  const canDeleteTicket = user.id === ticket.createdBy || user.role === 'ADMIN';

  const handleDeleteTicket = () => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      deleteTicket(ticket.id);
      onBack();
    }
  };

  const handleStatusToggle = () => {
    const newStatus = ticket.status === TicketStatus.ACTIVE ? TicketStatus.CLOSED : TicketStatus.ACTIVE;
    updateTicket(ticket.id, { status: newStatus });
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    addHistoryLog(ticket.id, {
      date: new Date().toISOString(),
      description: newLogText,
      userId: user.id,
      userName: user.username,
      userRole: user.role
    });
    setNewLogText('');
  };

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('Delete this history entry?')) {
        deleteHistoryLog(ticket.id, logId);
    }
  };

  const startEditLog = (log: HistoryLog) => {
    setEditingLogId(log.id);
    setEditingText(log.description);
  };

  const saveEditLog = () => {
      if(editingLogId) {
          updateHistoryLog(ticket.id, editingLogId, editingText);
          setEditingLogId(null);
      }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeTicket(ticket);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
          ← Back to Board
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            🖨 Print
          </button>
          {canDeleteTicket && (
            <button 
              onClick={handleDeleteTicket}
              className="bg-red-900/50 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg text-sm"
            >
              Delete Log
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Content (Printable) */}
      <div className="card bg-poly-card border border-gray-800 rounded-xl overflow-hidden shadow-2xl p-8 print-only">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between border-b border-gray-700 pb-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold text-white print:text-black">{ticket.title}</h1>
               <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === TicketStatus.ACTIVE ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                   {ticket.status}
               </span>
            </div>
            <p className="text-sm text-gray-400 print:text-gray-600">ID: {ticket.id} • Created: {new Date(ticket.dateReported).toLocaleString()}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right space-y-1">
             <div className="text-sm">Priority: <span className="font-bold text-poly-primary">{ticket.priority}</span></div>
             <div className="text-sm">Type: <span className="font-bold">{ticket.type}</span></div>
             <div className="text-sm text-gray-400">Reporter: {ticket.createdByName} ({ticket.createdByRole})</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
           <div className="col-span-2 space-y-6">
              <div>
                  <h3 className="text-lg font-semibold text-poly-primary mb-2">Description</h3>
                  <p className="text-gray-300 print:text-black whitespace-pre-wrap leading-relaxed bg-black/20 p-4 rounded-lg">
                      {ticket.description}
                  </p>
              </div>

              {/* AI Analysis Section */}
              <div className="no-print">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-purple-400">AI Maintenance Assistant</h3>
                    {!aiAnalysis && (
                        <button 
                            onClick={handleAnalyze} 
                            disabled={analyzing}
                            className="text-xs bg-purple-900/40 text-purple-300 border border-purple-700 px-2 py-1 rounded hover:bg-purple-900/60 disabled:opacity-50"
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze Issue'}
                        </button>
                    )}
                  </div>
                  
                  {aiAnalysis && (
                      <div className="bg-purple-900/10 border border-purple-800/50 p-4 rounded-lg text-sm text-gray-200 animate-slide-in">
                          <pre className="whitespace-pre-wrap font-sans text-gray-300">{aiAnalysis}</pre>
                      </div>
                  )}
              </div>
           </div>

           {/* Image Section */}
           <div>
              <h3 className="text-lg font-semibold text-poly-primary mb-2">Attachment</h3>
              {ticket.imageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-gray-700 bg-black/50">
                      <img src={ticket.imageUrl} alt="Defect" className="w-full h-auto object-cover hover:scale-105 transition-transform cursor-zoom-in" onClick={() => window.open(ticket.imageUrl, '_blank')} />
                  </div>
              ) : (
                  <div className="h-40 bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-500 text-sm italic border border-dashed border-gray-700">
                      No image attached
                  </div>
              )}
           </div>
        </div>

        {/* Status Toggle (Action) */}
        <div className="flex justify-end mb-8 no-print">
             <button
                onClick={handleStatusToggle}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    ticket.status === TicketStatus.ACTIVE 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                }`}
             >
                 {ticket.status === TicketStatus.ACTIVE ? '✓ Mark as Closed' : '↺ Reopen Log'}
             </button>
        </div>

        {/* History / Comments Section */}
        <div className="border-t border-gray-700 pt-8">
            <h3 className="text-xl font-bold text-white print:text-black mb-6 flex items-center gap-2">
                History & Actions 
                <span className="text-sm font-normal text-gray-500 bg-gray-800 px-2 rounded-full">{ticket.history.length}</span>
            </h3>

            {/* Log List (Last date is usually at the bottom as per standard chat/log flows, but prompt said "last date should be at the last of the list". I interpret this as chronological order (oldest -> newest)). */}
            <div className="space-y-4 mb-8">
                {ticket.history.length === 0 && <p className="text-gray-500 italic">No history logged yet.</p>}
                
                {ticket.history.map((log) => (
                    <div key={log.id} className="relative pl-6 border-l-2 border-gray-700 pb-2">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-poly-card border-2 border-poly-primary"></div>
                        <div className="flex flex-col bg-gray-800/40 p-3 rounded-md hover:bg-gray-800/60 transition-colors">
                             <div className="flex justify-between items-start mb-1">
                                 <div className="text-xs text-poly-primary font-bold uppercase tracking-wider">
                                    {log.userRole} • {log.userName}
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString()}</span>
                                    {/* Edit/Delete Controls */}
                                    {user.id === log.userId && (
                                        <div className="flex gap-1 no-print">
                                            <button onClick={() => startEditLog(log)} className="text-gray-500 hover:text-blue-400 text-xs">Edit</button>
                                            <button onClick={() => handleDeleteLog(log.id)} className="text-gray-500 hover:text-red-400 text-xs">Del</button>
                                        </div>
                                    )}
                                 </div>
                             </div>
                             
                             {editingLogId === log.id ? (
                                 <div className="mt-2 flex gap-2 no-print">
                                     <input 
                                        type="text" 
                                        value={editingText} 
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="flex-1 bg-black/20 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                                     />
                                     <button onClick={saveEditLog} className="text-green-400 text-xs uppercase font-bold">Save</button>
                                     <button onClick={() => setEditingLogId(null)} className="text-gray-400 text-xs uppercase font-bold">Cancel</button>
                                 </div>
                             ) : (
                                 <p className="text-gray-300 print:text-black text-sm">{log.description}</p>
                             )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Log Input */}
            {ticket.status === TicketStatus.ACTIVE && (
                <form onSubmit={handleAddLog} className="no-print mt-6 flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-poly-primary flex-shrink-0 flex items-center justify-center font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newLogText}
                            onChange={(e) => setNewLogText(e.target.value)}
                            placeholder="Add a progress update, repair note, or PM result..."
                            className="w-full bg-poly-dark border border-gray-700 rounded-lg p-3 text-white focus:border-poly-primary focus:outline-none min-h-[80px]"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                             <button type="submit" className="bg-poly-primary hover:bg-poly-primaryHover text-white px-4 py-2 rounded font-bold text-sm">
                                 Add Update
                             </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};