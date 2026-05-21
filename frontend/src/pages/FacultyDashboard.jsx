import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  ShieldAlert, CheckCircle, Clock, Plus, Send, Calendar, Lightbulb, MapPin,
  MessagesSquare, ThumbsUp, Trash2, Check, AlertCircle, Sparkles, X, Edit,
  Briefcase, HeartHandshake, Eye, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = () => useAuth();
  // Safe extraction of active user credentials from hook
  const activeUser = user || JSON.parse(localStorage.getItem('user'));

  // Tab switcher state: 'Complaints', 'Suggestions', 'Events', 'Forum'
  const [activeTab, setActiveTab] = useState('Complaints');

  // ==========================================
  // TAB 1: FACULTY DEPT COMPLAINTS
  // ==========================================
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: 'In Progress', comment: '' });

  const fetchDeptComplaints = async () => {
    try {
      setLoadingComplaints(true);
      // Faculty members see all complaints by default, but can focus on their department!
      const res = await api.get('/complaints');
      // Filter for faculty's department (e.g. "Computer Science" or "Mechanical")
      const dept = activeUser?.dept || 'Computer Science';
      const filtered = res.data.data.filter(c => c.assignedDept === dept || c.category.toLowerCase().includes(dept.toLowerCase().split(' ')[0]));
      setComplaints(filtered.length > 0 ? filtered : res.data.data); // Fallback to all if dept is empty
    } catch (err) {
      toast.error('Failed to load assigned department complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const submitTicketUpdate = async (id) => {
    try {
      await api.put(`/complaints/${id}`, {
        status: updateForm.status,
        comment: updateForm.comment.trim() || `Status updated to ${updateForm.status} by faculty mediator.`
      });
      toast.success('Grievance ticket status updated successfully!');
      setUpdatingTicket(null);
      setUpdateForm({ status: 'In Progress', comment: '' });
      fetchDeptComplaints();
    } catch (err) {
      toast.error('Failed to update ticket status.');
    }
  };

  // ==========================================
  // TAB 2: SUGGESTION BOARD
  // ==========================================
  const [suggestions, setSuggestions] = useState([]);
  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/university/suggestions');
      setSuggestions(res.data.data);
    } catch (err) {
      toast.error('Failed to load suggestions.');
    }
  };

  const voteSuggestion = async (id) => {
    try {
      await api.post(`/university/suggestions/${id}/vote`);
      fetchSuggestions();
    } catch (err) {
      toast.error('Upvoting suggestion failed.');
    }
  };

  // ==========================================
  // TAB 3: CAMPUS HACKATHON & EVENT CREATION
  // ==========================================
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '', category: 'Hackathon', slots: 50 });
  const [creatingEvent, setCreatingEvent] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to load campus events.');
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      setCreatingEvent(true);
      await api.post('/events', eventForm);
      toast.success('Event request published successfully! Pending Admin approval.');
      setShowEventForm(false);
      setEventForm({ title: '', description: '', date: '', location: '', category: 'Workshop', slots: 50 });
      fetchEvents();
    } catch (err) {
      toast.error('Failed to publish event.');
    } finally {
      setCreatingEvent(false);
    }
  };

  // ==========================================
  // TAB 4: DECENTRALIZED FORUM PANEL
  // ==========================================
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState('');
  const [postTag, setPostTag] = useState('General');
  const [postLoading, setPostLoading] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchForum = async () => {
    try {
      const res = await api.get('/forum');
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch discussion posts.');
    }
  };

  const submitForumPost = async (e) => {
    e.preventDefault();
    if (!postBody.trim()) return toast.error('Discussion body cannot be empty');
    try {
      setPostLoading(true);
      await api.post('/forum', { body: postBody, tag: postTag });
      toast.success('Discussion published successfully!');
      setPostBody('');
      fetchForum();
    } catch (err) {
      toast.error('Failed to post discussion.');
    } finally {
      setPostLoading(false);
    }
  };

  const likePost = async (id) => {
    try {
      await api.post(`/forum/${id}/like`);
      fetchForum();
    } catch (err) {
      toast.error('Casting vote failed.');
    }
  };

  const submitComment = async (id) => {
    if (!commentText.trim()) return toast.error('Reply text cannot be empty');
    try {
      await api.post(`/forum/${id}/comment`, { text: commentText });
      toast.success('Comment reply published!');
      setCommentText('');
      setActiveCommentPost(null);
      fetchForum();
    } catch (err) {
      toast.error('Failed to publish reply.');
    }
  };

  useEffect(() => {
    if (activeTab === 'Complaints') fetchDeptComplaints();
    if (activeTab === 'Suggestions') fetchSuggestions();
    if (activeTab === 'Events') fetchEvents();
    if (activeTab === 'Forum') fetchForum();
  }, [activeTab]);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Faculty Headings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Welcome Professor, {activeUser?.name.split(' ')[0]}!
            <Sparkles className="h-6 w-6 text-orange-500 fill-current  shrink-0" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            Faculty Dashboard • PCCOER {activeUser?.dept || 'Engineering Faculty'} Department Portal
          </p>
        </div>

        {activeTab === 'Events' && (
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow text-xs transition-all"
          >
            {showEventForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showEventForm ? 'Close Form' : 'Register Tech Event'}
          </button>
        )}
      </div>

      {/* Tab bar switch */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-2 scrollbar-thin">
        {[
          { id: 'Complaints', label: 'Department Grievances', icon: ShieldAlert },
          { id: 'Suggestions', label: 'Student Suggestions', icon: Lightbulb },
          { id: 'Events', label: 'Hackathons & Contests', icon: Calendar },
          { id: 'Forum', label: 'Peer Discussions', icon: MessagesSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER PANELS */}
      <div className="mt-6">

        {/* 1. GRIEVANCES SOLVER */}
        {activeTab === 'Complaints' && (
          <div className="space-y-6">
            {loadingComplaints ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
                {[1, 2, 3].map(n => <div key={n} className="h-40 bg-slate-100 dark:bg-slate-900 rounded-2xl" />)}
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-3">
                <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto"><CheckCircle className="h-6 w-6" /></div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">Clean Department Queue!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">There are no outstanding student complaints logged or assigned to your department branch!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((c) => (
                  <div key={c._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          c.status === 'Closed' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border dark:border-slate-850">
                          {c.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-1">{c.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{c.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Student: <span className="font-bold">{c.isAnonymous ? 'Anonymous' : c.studentId?.name || 'Academic'}</span>
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/complaint/${c._id}`} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-400 hover:text-slate-700 dark:hover:text-white"><Eye className="h-4 w-4" /></Link>
                        <button
                          onClick={() => { setUpdatingTicket(c); setUpdateForm({ status: c.status, comment: '' }); }}
                          className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Moderate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ticket moderate prompt modal */}
            <AnimatePresence>
              {updatingTicket && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-[420px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">Moderate Student Ticket</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ticket: {updatingTicket.title}</p>
                      </div>
                      <button onClick={() => setUpdatingTicket(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Update status</label>
                        <select
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none cursor-pointer"
                          value={updateForm.status}
                          onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress (Action Initiated)</option>
                          <option value="Resolved">Resolved (Completed)</option>
                          <option value="Closed">Closed (Spam/Redundant)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Audit Action Comment</label>
                        <textarea
                          rows={3}
                          placeholder="Describe the action taken e.g. Contacted electrician, repairing cables."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none resize-none"
                          value={updateForm.comment}
                          onChange={(e) => setUpdateForm({ ...updateForm, comment: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => submitTicketUpdate(updatingTicket._id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                      >
                        Commit Action Log
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 2. SUGGESTIONS */}
        {activeTab === 'Suggestions' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {suggestions.map((s) => (
                <div key={s._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {s.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        s.status === 'Implemented' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                        s.status === 'Approved' ? 'bg-blue-500/10 text-blue-500 border-blue-500/25' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/25'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base line-clamp-1">{s.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{s.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Proposed by: <span className="font-bold">{s.studentName}</span>
                    </span>
                    <button
                      onClick={() => voteSuggestion(s._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-450 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Support Upvote ({s.votes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. EVENT REGISTRY */}
        {activeTab === 'Events' && (
          <div className="space-y-6">
            {/* Drawer */}
            <AnimatePresence>
              {showEventForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 text-left"
                >
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3">Create Academic Campus Event</h3>
                  <form onSubmit={createEvent} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Event Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PCCOER National Robotics Hackathon 2026"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500"
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Category</label>
                          <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none cursor-pointer"
                            value={eventForm.category}
                            onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                          >
                            <option value="Coding">Coding Sprint</option>
                            <option value="Hackathon">Hackathon</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Cultural">Cultural Gathering</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Total Seats / Slots</label>
                          <input
                            type="number"
                            required
                            min={5}
                            max={200}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none"
                            value={eventForm.slots}
                            onChange={(e) => setEventForm({ ...eventForm, slots: parseInt(e.target.value, 10) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Agendas & details</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Describe event criteria, cash rewards, certification guidelines, and targeted departments."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none resize-none focus:border-orange-500"
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Event Date</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none"
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Location Venue</label>
                          <input
                            type="text"
                            placeholder="e.g. Auditorium Hall"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none"
                            value={eventForm.location}
                            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 border-t dark:border-slate-800 pt-4">
                      <button type="button" onClick={() => setShowEventForm(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                      <button type="submit" disabled={creatingEvent} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2">
                        {creatingEvent ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Publish Event <Send className="h-3.5 w-3.5" /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => (
                <div key={e._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl text-left flex flex-col justify-between shadow-sm relative">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <Calendar className="h-8 w-8 text-orange-500" />
                      <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                        {e.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{e.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{e.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-bold"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />{e.location}</span>
                      <span className="flex items-center gap-1 font-bold"><Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Registered: <span className="font-black text-indigo-500">{e.registeredStudents?.length || 0} / {e.slots}</span></span>
                      <span className="text-[10px] bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 px-2.5 py-1 rounded-full text-slate-450 font-bold uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. DISCUSSIONS BOARD */}
        {activeTab === 'Forum' && (
          <div className="space-y-8 text-left">
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Create Post Form */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-5 w-5 text-indigo-500 " />
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Broadcast Thread</h3>
                </div>

                <form onSubmit={submitForumPost} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Broadcaster Text</label>
                    <textarea
                      required
                      rows={5}
                      maxLength={1000}
                      placeholder="Share exam guidelines, placement notices, or academic suggestions inline with students..."
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none resize-none focus:border-orange-500"
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Category Tag</label>
                    <select
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                      value={postTag}
                      onChange={(e) => setPostTag(e.target.value)}
                    >
                      <option value="General">General Broadcast</option>
                      <option value="Placements">Placements Announcements</option>
                      <option value="Technical">Technical Curriculums</option>
                      <option value="Events">Hackathons Promos</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={postLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {postLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Broadcast post <Send className="h-3.5 w-3.5" /></>}
                  </button>
                </form>
              </div>

              {/* Right Column: Forum list */}
              <div className="md:col-span-7 space-y-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover:shadow transition-shadow space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 text-white font-black flex items-center justify-center text-xs shrink-0 select-none">
                          {post.userName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-xs md:text-sm leading-none">{post.userName}</h4>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">{post.userRole}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded border" style={{ color: post.tagColor, borderColor: `${post.tagColor}40`, backgroundColor: `${post.tagColor}0D` }}>
                        {post.tag}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-350 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-5 text-slate-450 dark:text-slate-500 text-xs font-bold">
                      <button onClick={() => likePost(post._id)} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Upvote ({post.likes?.length || 0})</span>
                      </button>
                      <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                        <MessagesSquare className="h-4 w-4" />
                        <span>Replies ({post.comments?.length || 0})</span>
                      </button>
                    </div>

                    {/* Comments list */}
                    {activeCommentPost === post._id && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="space-y-3.5 pl-3 border-l-2 border-slate-200 dark:border-slate-850">
                          {post.comments?.map((comment, cIdx) => (
                            <div key={cIdx} className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="font-extrabold text-slate-700 dark:text-slate-300">{comment.userName}</span>
                                <span className="text-slate-400 font-medium">({comment.userRole})</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{comment.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply box */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type comment reply..."
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <button
                            onClick={() => submitComment(post._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
