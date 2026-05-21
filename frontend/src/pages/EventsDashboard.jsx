import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ChevronRight, Clock, Star, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function EventsDashboard() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load events');
    }
  };

  const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-300 bg-clip-text text-transparent mb-4">
              Campus Hackathons & Events
            </h1>
            <p className="text-slate-400 text-lg">Discover, build, and compete in premier university challenges.</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <button
              onClick={() => navigate('/events/create')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all shrink-0"
            >
              <PlusCircle className="h-5 w-5" /> Organize Event
            </button>
          )}
        </header>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {['All', 'Hackathon', 'Coding', 'Cultural', 'Sports', 'Workshop'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={event._id}
              onClick={() => navigate(`/events/${event._id}`)}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all cursor-pointer group"
            >
              <div className={`h-32 bg-gradient-to-br ${event.color} relative p-6 flex items-end`}>
                <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                  {event.status}
                </span>
                <span className="text-5xl drop-shadow-lg">{event.emoji}</span>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 text-orange-400 text-xs font-bold uppercase tracking-wider">
                  <Star className="h-3 w-3" />
                  {event.category}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">{event.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-6">{event.description}</p>
                
                <div className="space-y-3 mb-6 text-sm text-slate-300 font-medium">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-slate-500" />
                    {event.eventType === 'Team' ? `Teams of ${event.teamSize}` : 'Individual'}
                  </div>
                </div>

                <button className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-sm group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all flex items-center justify-center gap-2">
                  View Details <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
