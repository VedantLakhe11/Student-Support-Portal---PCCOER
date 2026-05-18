import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Plus, Search, Filter, ArrowUpDown, Send, Upload, Calendar, Clock, Sparkles,
  ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, HelpCircle, FileText, X,
  ThumbsUp, BookOpen, GraduationCap, MapPin, MessagesSquare, CheckCircle, Flame,
  Lightbulb, Briefcase, ChevronRightSquare, HeartHandshake, Eye, Dumbbell, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Active Main tab: 'Complaints', 'Suggestions', 'Events', 'Library', 'Mentorship', 'Facilities', 'Forum'
  const [activeTab, setActiveTab] = useState('Complaints');

  // ==========================================
  // TAB 1: COMPLAINTS STATE & UTILS
  // ==========================================
  const [complaints, setComplaints] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintFilters, setComplaintFilters] = useState({ category: 'All', status: 'All', search: '', sort: 'latest' });
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'WiFi', isAnonymous: false });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);

  const categories = ['WiFi', 'Electricity', 'Water Leakage', 'Cleanliness', 'Hostel', 'Ragging', 'Lab Equipment', 'Classroom', 'Canteen', 'Other'];

  const fetchComplaints = async () => {
    try {
      setComplaintLoading(true);
      let endpoint = `/complaints?sort=${complaintFilters.sort}`;
      if (complaintFilters.category !== 'All') endpoint += `&category=${complaintFilters.category}`;
      if (complaintFilters.status !== 'All') endpoint += `&status=${complaintFilters.status}`;
      if (complaintFilters.search.trim()) endpoint += `&search=${encodeURIComponent(complaintFilters.search.trim())}`;

      const res = await api.get(endpoint);
      setComplaints(res.data.data);
    } catch (err) {
      toast.error('Failed to load complaints feed.');
    } finally {
      setComplaintLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image size cannot exceed 5MB');
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.title.trim() || !complaintForm.description.trim()) {
      return toast.error('Please enter complaint title and description');
    }
    try {
      setComplaintSubmitting(true);
      const formData = new FormData();
      formData.append('title', complaintForm.title.trim());
      formData.append('description', complaintForm.description.trim());
      formData.append('category', complaintForm.category);
      formData.append('isAnonymous', complaintForm.isAnonymous);
      if (selectedImage) formData.append('image', selectedImage);

      await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Complaint ticket registered successfully!');
      setShowComplaintForm(false);
      setComplaintForm({ title: '', description: '', category: 'WiFi', isAnonymous: false });
      setSelectedImage(null);
      setImagePreview(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.cleanMessage || 'Failed to submit complaint.');
    } finally {
      setComplaintSubmitting(false);
    }
  };

  // ==========================================
  // TAB 2: SUGGESTIONS STATE & UTILS
  // ==========================================
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ title: '', description: '', category: 'Infrastructure', isAnonymous: false });
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/university/suggestions');
      setSuggestions(res.data.data);
    } catch (err) {
      toast.error('Failed to load suggestions.');
    }
  };

  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!suggestionForm.title.trim() || !suggestionForm.description.trim()) {
      return toast.error('Please enter suggestion title and description');
    }
    try {
      setSuggestionSubmitting(true);
      await api.post('/university/suggestions', suggestionForm);
      toast.success('Suggestion published successfully!');
      setShowSuggestionForm(false);
      setSuggestionForm({ title: '', description: '', category: 'Infrastructure', isAnonymous: false });
      fetchSuggestions();
    } catch (err) {
      toast.error(err.cleanMessage || 'Failed to submit suggestion.');
    } finally {
      setSuggestionSubmitting(false);
    }
  };

  const upvoteSuggestion = async (id) => {
    try {
      const res = await api.post(`/university/suggestions/${id}/vote`);
      toast.success(res.data.message);
      fetchSuggestions();
    } catch (err) {
      toast.error('Upvoting failed.');
    }
  };

  // ==========================================
  // TAB 3: EVENTS STATE & UTILS
  // ==========================================
  const [events, setEvents] = useState([]);
  const fetchEvents = async () => {
    try {
      const res = await api.get('/university/events');
      setEvents(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve events feed.');
    }
  };

  const registerForEvent = async (id) => {
    try {
      const res = await api.post(`/university/events/${id}/register`);
      toast.success(res.data.message);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  // ==========================================
  // TAB 4: LIBRARY STATE & UTILS
  // ==========================================
  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const fetchBooks = async () => {
    try {
      const url = bookSearch.trim() ? `/university/books?search=${encodeURIComponent(bookSearch)}` : '/university/books';
      const res = await api.get(url);
      setBooks(res.data.data);
    } catch (err) {
      toast.error('Failed to load books catalog.');
    }
  };

  const reserveBook = async (id) => {
    try {
      const res = await api.post(`/university/books/${id}/reserve`);
      toast.success(res.data.message);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reserving copy failed.');
    }
  };

  // ==========================================
  // TAB 5: ALUMNI MENTORSHIP STATE
  // ==========================================
  const [mentors, setMentors] = useState([]);
  const [mentoringMessage, setMentoringMessage] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const fetchMentors = async () => {
    try {
      const res = await api.get('/university/mentors');
      setMentors(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch mentors list.');
    }
  };

  const requestMentoring = async (id) => {
    if (!mentoringMessage.trim()) return toast.error('Please enter a brief introductory message');
    try {
      const res = await api.post(`/university/mentors/${id}/request`, { message: mentoringMessage });
      toast.success(res.data.message);
      setSelectedMentor(null);
      setMentoringMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed.');
    }
  };

  // ==========================================
  // TAB 6: FACILITIES STATE
  // ==========================================
  const [facilities, setFacilities] = useState([]);
  const [bookingFacility, setBookingFacility] = useState(null);
  const [bookingForm, setBookingForm] = useState({ purpose: '', bookingDate: '' });
  const fetchFacilities = async () => {
    try {
      const res = await api.get('/university/facilities');
      setFacilities(res.data.data);
    } catch (err) {
      toast.error('Failed to load campus facilities.');
    }
  };

  const requestFacilityBooking = async (id) => {
    if (!bookingForm.purpose.trim() || !bookingForm.bookingDate) {
      return toast.error('Please fill in both booking purpose and date');
    }
    try {
      const res = await api.post(`/university/facilities/${id}/book`, bookingForm);
      toast.success(res.data.message);
      setBookingFacility(null);
      setBookingForm({ purpose: '', bookingDate: '' });
      fetchFacilities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking request failed.');
    }
  };

  // ==========================================
  // TAB 7: DISCUSSIONS FORUM STATE
  // ==========================================
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState('');
  const [postTag, setPostTag] = useState('General');
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchForumPosts = async () => {
    try {
      const res = await api.get('/forum');
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch discussion forum.');
    }
  };

  const createForumPost = async (e) => {
    e.preventDefault();
    if (!postBody.trim()) return toast.error('Discussion text is required');
    try {
      setPostSubmitting(true);
      await api.post('/forum', { body: postBody, tag: postTag });
      toast.success('Discussion published successfully!');
      setPostBody('');
      setPostTag('General');
      fetchForumPosts();
    } catch (err) {
      toast.error('Failed to post discussion.');
    } finally {
      setPostSubmitting(false);
    }
  };

  const likeForumPost = async (id) => {
    try {
      await api.post(`/forum/${id}/like`);
      fetchForumPosts();
    } catch (err) {
      toast.error('Liking post failed.');
    }
  };

  const addForumComment = async (id) => {
    if (!commentText.trim()) return toast.error('Comment cannot be empty');
    try {
      await api.post(`/forum/${id}/comment`, { text: commentText });
      toast.success('Reply submitted!');
      setCommentText('');
      setActiveCommentPost(null);
      fetchForumPosts();
    } catch (err) {
      toast.error('Failed to comment on post.');
    }
  };

  // Trigger correct fetches on activeTab change
  useEffect(() => {
    if (activeTab === 'Complaints') fetchComplaints();
    if (activeTab === 'Suggestions') fetchSuggestions();
    if (activeTab === 'Events') fetchEvents();
    if (activeTab === 'Library') fetchBooks();
    if (activeTab === 'Mentorship') fetchMentors();
    if (activeTab === 'Facilities') fetchFacilities();
    if (activeTab === 'Forum') fetchForumPosts();
  }, [activeTab, complaintFilters.category, complaintFilters.status, complaintFilters.sort]);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Welcome, {user?.name.split(' ')[0]}!
            <Sparkles className="h-6 w-6 text-orange-500 fill-current animate-pulse-slow shrink-0" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            Student Support Portal — {user?.dept || 'General Dept'} • PRN: {user?.prn || 'N/A'} • {user?.year || '1st Year'}
          </p>
        </div>
        
        {/* Context Button */}
        {activeTab === 'Complaints' && (
          <button
            onClick={() => setShowComplaintForm(!showComplaintForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 text-xs md:text-sm transition-all"
          >
            {showComplaintForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showComplaintForm ? 'Close Form' : 'Register Complaint'}
          </button>
        )}
        {activeTab === 'Suggestions' && (
          <button
            onClick={() => setShowSuggestionForm(!showSuggestionForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 text-xs md:text-sm transition-all"
          >
            {showSuggestionForm ? <X className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
            {showSuggestionForm ? 'Close Form' : 'Propose Suggestion'}
          </button>
        )}
      </div>

      {/* Main Tab bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-2 scrollbar-thin">
        {[
          { id: 'Complaints', label: 'Complaints', icon: ShieldCheck },
          { id: 'Suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'Events', label: 'Hackathons', icon: Calendar },
          { id: 'Library', label: 'Library Books', icon: BookOpen },
          { id: 'Mentorship', label: 'Alumni Mentoring', icon: HeartHandshake },
          { id: 'Facilities', label: 'Facilities Booking', icon: Dumbbell },
          { id: 'Forum', label: 'Student Forum', icon: MessagesSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TABS CONTAINER */}
      <div className="mt-6">

        {/* 1. COMPLAINTS TAB */}
        {activeTab === 'Complaints' && (
          <div className="space-y-6">
            {/* Form Drawer */}
            <AnimatePresence>
              {showComplaintForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-6"
                >
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3">Register New Campus Ticket</h3>
                  <form onSubmit={submitComplaint} className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Complaint Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Broken bench in room 305"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          value={complaintForm.title}
                          onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Category</label>
                          <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none cursor-pointer"
                            value={complaintForm.category}
                            onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                          >
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center pt-6 pl-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-500 dark:text-slate-400">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 dark:border-slate-700 text-orange-500 focus:ring-orange-500 cursor-pointer"
                              checked={complaintForm.isAnonymous}
                              onChange={(e) => setComplaintForm({ ...complaintForm, isAnonymous: e.target.checked })}
                            />
                            File Anonymously
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Issue Description</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Please provide explicit context, including location detail (e.g. Block A, second floor near cafeteria) to facilitate swift maintenance dispatch."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          value={complaintForm.description}
                          onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Image attachments */}
                    <div className="md:col-span-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col items-center justify-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} className="h-32 object-cover rounded-xl shadow-md" />
                          <button
                            type="button"
                            onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                            className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white p-1 rounded-full hover:bg-rose-600 shadow"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
                          <Upload className="h-8 w-8 stroke-[1.5]" />
                          <span className="text-xs font-bold uppercase tracking-wider">Attach Incident Image (Max 5MB)</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 border-t dark:border-slate-800 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowComplaintForm(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={complaintSubmitting}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs transition-all"
                      >
                        {complaintSubmitting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Submit ticket <Send className="h-3.5 w-3.5" /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complaint filter board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Search complaints..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 pl-10 pr-4 text-xs outline-none"
                  value={complaintFilters.search}
                  onChange={(e) => setComplaintFilters({ ...complaintFilters, search: e.target.value })}
                />
                <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer"
                  value={complaintFilters.category}
                  onChange={(e) => setComplaintFilters({ ...complaintFilters, category: e.target.value })}
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none cursor-pointer"
                  value={complaintFilters.status}
                  onChange={(e) => setComplaintFilters({ ...complaintFilters, status: e.target.value })}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Complaints grid */}
            {complaintLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-44 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl" />
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12 border border-slate-200/50 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-900/40 max-w-xl mx-auto space-y-3">
                <div className="bg-orange-500/10 text-orange-500 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto"><ShieldCheck className="h-6 w-6" /></div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">No tickets logged</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">There are no complaints aligned to the active filters. Log a new ticket above if something requires resolution!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((c) => (
                  <div key={c._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-center gap-2 mb-3">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          c.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          c.status === 'Closed' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border dark:border-slate-850">
                          {c.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug line-clamp-1 mb-2">
                        {c.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                        {c.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <Link to={`/complaint/${c._id}`} className="text-orange-500 font-black hover:underline">
                        Review Timeline
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SUGGESTIONS TAB */}
        {activeTab === 'Suggestions' && (
          <div className="space-y-6">
            {/* Form Drawer */}
            <AnimatePresence>
              {showSuggestionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-6"
                >
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3">Propose Campus Enhancement Idea</h3>
                  <form onSubmit={submitSuggestion} className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Enhancement Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Introduce smart e-bike loops inside campus"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500"
                          value={suggestionForm.title}
                          onChange={(e) => setSuggestionForm({ ...suggestionForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Category</label>
                          <select
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none cursor-pointer"
                            value={suggestionForm.category}
                            onChange={(e) => setSuggestionForm({ ...suggestionForm, category: e.target.value })}
                          >
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Canteen Menu">Canteen Menu</option>
                            <option value="Sports Arena">Sports Arena</option>
                            <option value="Library Hours">Library Hours</option>
                            <option value="Other">Other Category</option>
                          </select>
                        </div>
                        <div className="flex items-center pt-6 pl-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-500 dark:text-slate-400">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 dark:border-slate-700 text-orange-500"
                              checked={suggestionForm.isAnonymous}
                              onChange={(e) => setSuggestionForm({ ...suggestionForm, isAnonymous: e.target.checked })}
                            />
                            Post Anonymously
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Idea Details / Description</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Describe the suggestion thoroughly, mentioning benefits to students or faculty. Other campus users can review and cast upvotes."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none resize-none focus:border-orange-500"
                          value={suggestionForm.description}
                          onChange={(e) => setSuggestionForm({ ...suggestionForm, description: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 border-t dark:border-slate-800 pt-4">
                      <button type="button" onClick={() => setShowSuggestionForm(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                      <button type="submit" disabled={suggestionSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2">
                        {suggestionSubmitting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Publish proposal <Send className="h-3.5 w-3.5" /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions list */}
            {suggestions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl max-w-xl mx-auto space-y-3">
                <div className="bg-orange-500/10 text-orange-500 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto"><Lightbulb className="h-6 w-6" /></div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">No suggestions yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Be the first to propose a campus enhancement idea for PCCOER!</p>
              </div>
            ) : (
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
                        Proposed by: <span className="font-bold">{s.isAnonymous ? 'Anonymous Student' : s.studentName}</span>
                      </span>
                      <button
                        onClick={() => upvoteSuggestion(s._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          s.votedUsers?.includes(user?._id)
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/10'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>Upvote ({s.votes})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. EVENTS & HACKATHONS TAB */}
        {activeTab === 'Events' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => {
                const isRegistered = e.registeredStudents?.includes(user?._id);
                const slotsLeft = Math.max(0, e.slots - (e.registeredStudents?.length || 0));
                return (
                  <div key={e._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-3xl">{e.emoji || '📅'}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                          {e.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{e.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{e.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-bold"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />{e.location}</span>
                        <span className="flex items-center gap-1 font-bold"><Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          {slotsLeft <= 5 ? (
                            <span className="text-rose-500 font-extrabold animate-pulse">{slotsLeft} seats left!</span>
                          ) : (
                            <span>{slotsLeft} slots remaining</span>
                          )}
                        </span>
                        <button
                          onClick={() => registerForEvent(e._id)}
                          disabled={isRegistered || slotsLeft === 0}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                            isRegistered
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                              : slotsLeft === 0
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border dark:border-slate-800'
                              : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-102 hover:shadow shadow-orange-500/20'
                          }`}
                        >
                          {isRegistered ? 'Registered' : slotsLeft === 0 ? 'Full Slot' : 'Lock Seat'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. LIBRARY BOOKS TAB */}
        {activeTab === 'Library' && (
          <div className="space-y-6">
            {/* Search board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search catalogue by book title, author, or engineering category..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              </div>
              <button
                onClick={fetchBooks}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Search Catalog
              </button>
            </div>

            {/* Books catalog layout */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((b) => {
                const hasReserved = b.reservations?.some(r => r.studentId.toString() === user?._id.toString() && r.status === 'Active');
                return (
                  <div key={b._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between text-left shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="w-16 h-24 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-3xl flex items-center justify-center shrink-0">
                        {b.emoji || '📖'}
                      </div>
                      <div className="space-y-1 select-text">
                        <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                          {b.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-snug line-clamp-2 mt-1">{b.title}</h4>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">By: <span className="font-bold">{b.author}</span></span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <span>Shelf Location: <span className="text-orange-500 font-black">{b.rack}</span></span>
                        <span>Copies: <span className="text-slate-700 dark:text-slate-200">{b.available} / {b.total}</span></span>
                      </div>

                      <button
                        onClick={() => reserveBook(b._id)}
                        disabled={hasReserved || b.available <= 0}
                        className={`w-full py-2 rounded-xl text-xs font-black uppercase transition-all border ${
                          hasReserved
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default'
                            : b.available <= 0
                            ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-400 cursor-not-allowed'
                            : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:shadow shadow-orange-500/15'
                        }`}
                      >
                        {hasReserved ? 'Active Reservation' : b.available <= 0 ? 'Out of Stock' : 'Reserve Physical Copy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. ALUMNI MENTORSHIP TAB */}
        {activeTab === 'Mentorship' && (
          <div className="space-y-8 text-left">
            {/* Guidance Blogs / Placement Experiences Carousels */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Alumni Placement Guidance Logs</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.flatMap(m => m.guidanceBlogs || []).slice(0, 3).map((blog, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-gradient-to-tr from-slate-50 to-indigo-50/20 dark:from-slate-900/60 dark:to-orange-950/5 border border-slate-200/50 dark:border-slate-850 hover:shadow-md transition-shadow relative">
                    <span className="absolute right-4 top-4 text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                      {blog.category || 'Interview Log'}
                    </span>
                    <div className="space-y-2 mt-3">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{blog.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{blog.content}</p>
                    </div>
                    <button
                      onClick={() => toast.success(`Full post details: \n\n${blog.content}`, { duration: 6000 })}
                      className="text-[11px] font-black uppercase tracking-wider text-orange-500 hover:underline mt-4 flex items-center gap-1"
                    >
                      Read full guidance guide <ChevronRightSquare className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentors profile grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Request Direct Mentorship Guidance</h3>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((m) => (
                  <div key={m._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow relative">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.userId?.avatar || '/pccoerimg.jpeg'}
                          alt={m.name}
                          className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow"
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-none">{m.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 block">{m.userId?.dept || 'Computer Science'} Alumni</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Employer:</span><span className="font-bold text-slate-800 dark:text-slate-200">{m.company}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Position:</span><span className="font-bold text-slate-800 dark:text-slate-200">{m.jobRole}</span></div>
                        <div className="flex flex-wrap gap-1.5 pt-1.5"><span className="text-slate-400 w-full mb-0.5">Skills:</span>{m.skills?.map(s => <span key={s} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase rounded">{s}</span>)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMentor(m)}
                      className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                    >
                      Request Guidance Connection
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentorship request prompt drawer */}
            <AnimatePresence>
              {selectedMentor && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-[450px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">Request Guidance</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mentor: {selectedMentor.name} • {selectedMentor.company}</p>
                      </div>
                      <button onClick={() => setSelectedMentor(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Introduction Message</label>
                        <textarea
                          rows={4}
                          placeholder="e.g. Hello, I am TE student in CS department. I saw you work at Google. Can you please guide me on DSA strategy or schedule a 15 min chat?"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                          value={mentoringMessage}
                          onChange={(e) => setMentoringMessage(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => requestMentoring(selectedMentor._id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                      >
                        Transmit Invitation Request
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 6. FACILITIES BOOKING TAB */}
        {activeTab === 'Facilities' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((fac) => {
                const operational = fac.status === 'Operational';
                return (
                  <div key={fac._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-3xl">🏟️</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          operational
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {fac.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{fac.name}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{fac.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Timings: {fac.timing || '9 AM - 6 PM'}</span>
                      <button
                        onClick={() => {
                          if (!operational) return toast.error('Facility is offline for maintenance.');
                          setBookingFacility(fac);
                        }}
                        disabled={!operational}
                        className={`px-4.5 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                          operational
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border dark:border-slate-850'
                        }`}
                      >
                        {operational ? 'Book Space' : 'Maintenance'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Facility scheduling drawer */}
            <AnimatePresence>
              {bookingFacility && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-[420px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">Book {bookingFacility.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Request approval for student activities</p>
                      </div>
                      <button onClick={() => setBookingFacility(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Target Booking Date</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none"
                          value={bookingForm.bookingDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Booking Purpose</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="e.g. Conduct Computer Society coding contest or seminar presentation."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none resize-none"
                          value={bookingForm.purpose}
                          onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => requestFacilityBooking(bookingFacility._id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                      >
                        Submit Reservation Request
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 7.peer DISCUSSIONS FORUM TAB */}
        {activeTab === 'Forum' && (
          <div className="space-y-8 text-left">
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Create Post Form */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Start a Discussion</h3>
                </div>

                <form onSubmit={createForumPost} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Discussion Body</label>
                    <textarea
                      required
                      rows={5}
                      maxLength={1000}
                      placeholder="Ask a technical coding question, inquire about placements, or request advice from peers and faculty members..."
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
                      <option value="General">General</option>
                      <option value="Placements">Placements Guidance</option>
                      <option value="Technical">Technical Bugs</option>
                      <option value="Events">Campus Events</option>
                      <option value="Study Groups">Study Groups</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={postSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {postSubmitting ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Publish Discussion <Send className="h-3.5 w-3.5" /></>}
                  </button>
                </form>
              </div>

              {/* Right Column: Forum feed listing */}
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
                      <button onClick={() => likeForumPost(post._id)} className={`flex items-center gap-1.5 hover:text-orange-500 transition-colors ${post.likes?.includes(user?._id) ? 'text-orange-500' : ''}`}>
                        <ThumbsUp className="h-4 w-4" />
                        <span>Upvote ({post.likes?.length || 0})</span>
                      </button>
                      <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                        <MessagesSquare className="h-4 w-4" />
                        <span>Replies ({post.comments?.length || 0})</span>
                      </button>
                    </div>

                    {/* Comments Sub-feed */}
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
                            onClick={() => addForumComment(post._id)}
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

export default StudentDashboard;
