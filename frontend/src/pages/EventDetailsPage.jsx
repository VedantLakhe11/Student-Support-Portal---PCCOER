import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Trophy, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    checkRegistration();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get('/events');
      const found = res.data.data.find(e => e._id === id);
      setEvent(found);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load event details');
    }
  };

  const checkRegistration = async () => {
    try {
      const res = await api.get('/events/my-registrations');
      const reg = res.data.data.find(r => r.event._id === id);
      if (reg) setIsRegistered(true);
    } catch (err) {}
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const payload = {};
      if (event.eventType === 'Team') {
        if (!teamName && !joinCode) {
          toast.error('Please provide a team name or join code');
          setRegistering(false);
          return;
        }
        if (teamName) payload.teamName = teamName;
        if (joinCode) payload.joinCode = joinCode;
      }
      
      await api.post(`/events/${id}/register`, payload);
      toast.success('Successfully registered for the event!');
      setIsRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading || !event) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Event Payload...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <div className={`h-80 bg-gradient-to-br ${event.color} relative flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <span className="text-7xl drop-shadow-2xl mb-4 block">{event.emoji}</span>
          <h1 className="text-5xl font-extrabold text-white drop-shadow-xl">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-orange-500 font-bold mb-6 hover:text-orange-400">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </button>
              
              <h2 className="text-2xl font-extrabold mb-4 border-b border-slate-800 pb-4">Event Overview</h2>
              <p className="text-slate-300 leading-relaxed font-medium mb-8">
                {event.description}
              </p>

              {event.rules && event.rules.length > 0 && (
                <>
                  <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="h-5 w-5" /> Rules & Guidelines
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 font-medium mb-8">
                    {event.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-24">
              <h3 className="text-xl font-extrabold mb-6">Quick Info</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl"><Calendar className="h-5 w-5 text-orange-500" /></div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase">Date</span>
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl"><MapPin className="h-5 w-5 text-emerald-500" /></div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase">Location</span>
                    {event.location}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl"><Users className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase">Participation</span>
                    {event.eventType} ({event.eventType === 'Team' ? `Max ${event.teamSize} members` : 'Individual'})
                  </div>
                </div>
              </div>

              {!isRegistered ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  {event.eventType === 'Team' && (
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-400 font-bold">Team Details Required</p>
                      <input
                        type="text"
                        placeholder="Create New Team Name..."
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-orange-500"
                      />
                      <div className="text-center text-xs text-slate-600 font-bold">OR</div>
                      <input
                        type="text"
                        placeholder="Enter Join Code..."
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                  <button 
                    disabled={registering}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-extrabold transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50"
                  >
                    {registering ? 'Processing...' : 'Register Now'}
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  Successfully Registered
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
