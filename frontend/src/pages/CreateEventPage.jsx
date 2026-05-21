import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Send } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', eventType: 'Individual', teamSize: 1,
    date: '', location: '', category: 'Hackathon', rules: '', prizes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      payload.rules = formData.rules.split(',').map(r => r.trim());
      payload.prizes = formData.prizes.split(',').map(r => r.trim());
      
      await api.post('/events', payload);
      toast.success('Event Created Successfully! Pending Admin Approval.');
      navigate('/events');
    } catch (err) {
      toast.error('Failed to create event');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-orange-500">Create New Event / Hackathon</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Event Title</label>
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Hackathon</option><option>Coding</option><option>Cultural</option><option>Workshop</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
            <textarea required rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Type</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, eventType: e.target.value})}>
                <option>Individual</option><option>Team</option>
              </select>
            </div>
            {formData.eventType === 'Team' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Team Size</label>
                <input type="number" min="1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, teamSize: parseInt(e.target.value)})} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Date</label>
              <input required type="datetime-local" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Rules (comma separated)</label>
            <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, rules: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
            <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3" onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>

          <button type="submit" className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <Send className="h-4 w-4" /> Publish Event
          </button>
        </form>
      </div>
    </div>
  );
}
