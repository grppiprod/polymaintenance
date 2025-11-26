import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TicketType, PriorityLevel, TicketStatus } from '../types';

interface CreateTicketModalProps {
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose }) => {
  const { addTicket } = useData();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>(TicketType.REPAIR);
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [image, setImage] = useState<string | undefined>(undefined);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addTicket({
      title,
      description,
      type,
      priority,
      status: TicketStatus.ACTIVE,
      dateReported: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.username,
      createdByRole: user.role,
      imageUrl: image
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-poly-card w-full max-w-lg rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">New Log Entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="create-ticket-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={type === TicketType.REPAIR} onChange={() => setType(TicketType.REPAIR)} className="text-poly-primary focus:ring-poly-primary" />
                  <span className={type === TicketType.REPAIR ? 'text-white' : 'text-gray-500'}>Repair</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={type === TicketType.PM} onChange={() => setType(TicketType.PM)} className="text-poly-primary focus:ring-poly-primary" />
                  <span className={type === TicketType.PM ? 'text-white' : 'text-gray-500'}>Preventive Maintenance</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input 
                required 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-poly-dark border border-gray-600 rounded p-2 text-white focus:border-poly-primary focus:outline-none"
                placeholder="E.g., Conveyor Belt Jam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
              <select 
                value={priority} 
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-poly-dark border border-gray-600 rounded p-2 text-white focus:border-poly-primary focus:outline-none"
              >
                {Object.values(PriorityLevel).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-poly-dark border border-gray-600 rounded p-2 text-white focus:border-poly-primary focus:outline-none h-24"
                placeholder="Describe the issue or maintenance required..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Attachment (Image)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-poly-primary file:text-white hover:file:bg-poly-primaryHover"
              />
              {image && (
                <div className="mt-2 w-full h-32 rounded bg-black/50 overflow-hidden">
                   <img src={image} alt="Preview" className="h-full w-full object-contain" />
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-poly-card rounded-b-xl">
           <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
           <button type="submit" form="create-ticket-form" className="px-6 py-2 bg-poly-primary hover:bg-poly-primaryHover text-white font-bold rounded shadow-lg">Submit Log</button>
        </div>
      </div>
    </div>
  );
};