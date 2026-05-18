import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldAlert, Clock, CheckCircle, FileText, Search, Filter, Trash2, Edit,
  Eye, Calendar, MessageSquare, ChevronLeft, ChevronRight, TrendingUp,
  Sparkles, ShieldX, ToggleLeft, ToggleRight, GraduationCap, Lightbulb,
  Check, Ban, Users, Layers, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const AdminDashboard = () => {
  // Tabs: 'Metrics', 'Complaints', 'Users', 'Suggestions'
  const [activeTab, setActiveTab] = useState('Metrics');

  // ==========================================
  // TAB 1: METRICS & CHARTS STATE
  // ==========================================
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
      setCategoryData(res.data.categoryData.filter(c => c.value > 0));
      setTimelineData(res.data.timelineData);
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  };

  // ==========================================
  // TAB 2: COMPLAINTS DATATABLE STATE
  // ==========================================
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintFilters, setComplaintFilters] = useState({ category: 'All', status: 'All', search: '' });
  const [complaintPagination, setComplaintPagination] = useState({ page: 1, limit: 6, totalPages: 1, total: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: 'Pending', comment: '' });
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);

  const fetchComplaints = async (pageNumber = 1) => {
    try {
      setLoadingComplaints(true);
      const { category, status, search } = complaintFilters;
      let endpoint = `/complaints?page=${pageNumber}&limit=${complaintPagination.limit}`;
      if (category !== 'All') endpoint += `&category=${category}`;
      if (status !== 'All') endpoint += `&status=${status}`;
      if (search.trim()) endpoint += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(endpoint);
      setComplaints(res.data.data);
      setComplaintPagination({
        page: res.data.pagination.page,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total,
        limit: res.data.pagination.limit
      });
    } catch (err) {
      toast.error('Failed to load complaints catalog.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      setUpdatingTicket(true);
      await api.put(`/complaints/${selectedTicket._id}`, {
        status: statusForm.status,
        comment: statusForm.comment || `Status updated to ${statusForm.status} by administrator.`
      });
      toast.success('Ticket status updated successfully!');
      setShowStatusModal(false);
      setSelectedTicket(null);
      fetchStats();
      fetchComplaints(complaintPagination.page);
    } catch (err) {
      toast.error('Failed to modify ticket status.');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!ticketToDelete) return;
    try {
      setDeletingTicket(true);
      await api.delete(`/complaints/${ticketToDelete._id}`);
      toast.success('Ticket permanently purged (Spam Removal)');
      setShowDeleteModal(false);
      setTicketToDelete(null);
      fetchStats();
      fetchComplaints(1);
    } catch (err) {
      toast.error('Failed to purge ticket.');
    } finally {
      setDeletingTicket(false);
    }
  };

  // ==========================================
  // TAB 3: USER DIRECTORY STATE
  // ==========================================
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve user accounts.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSuspension = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/ban`);
      toast.success(res.data.message);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error('Failed to change suspension state.');
    }
  };

  const changeUserAuthority = async (id, newRole) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update authority role.');
    }
  };

  // ==========================================
  // TAB 4: SUGGESTIONS MODERATION STATE
  // ==========================================
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await api.get('/university/suggestions');
      setSuggestions(res.data.data);
    } catch (err) {
      toast.error('Failed to load suggestions.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const moderateSuggestionStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/suggestions/${id}`, { status });
      toast.success(res.data.message);
      fetchSuggestions();
    } catch (err) {
      toast.error('Failed to moderate suggestion status.');
    }
  };

  // Trigger correct endpoints on activeTab change
  useEffect(() => {
    if (activeTab === 'Metrics') fetchStats();
    if (activeTab === 'Complaints') fetchComplaints(1);
    if (activeTab === 'Users') fetchUsers();
    if (activeTab === 'Suggestions') fetchSuggestions();
  }, [activeTab, complaintFilters.category, complaintFilters.status]);

  // Color Mapping helpers for Recharts
  const COLORS = ['#f97316', '#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const categories = ['WiFi', 'Electricity', 'Water Leakage', 'Cleanliness', 'Hostel', 'Ragging', 'Lab Equipment', 'Classroom', 'Canteen', 'Other'];

  const getStatusBadge = (status) => {
    const schemes = {
      Pending: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30',
      'In Progress': 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
      Resolved: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
      Closed: 'bg-slate-50 dark:bg-slate-855/20 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/30',
    };
    return schemes[status] || schemes.Pending;
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Headings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Campus Operations Center
            <Sparkles className="h-6 w-6 text-orange-500 fill-current animate-pulse-slow shrink-0" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            PCCOER Administrative Control — Decentralized grievance dispatch, user suspensions, and campus analytics.
          </p>
        </div>
      </div>

      {/* Admin main tabs switcher */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-2 scrollbar-thin">
        {[
          { id: 'Metrics', label: 'Metrics & Trends', icon: TrendingUp },
          { id: 'Complaints', label: 'Campus Complaints', icon: ShieldAlert },
          { id: 'Users', label: 'User Directory', icon: Users },
          { id: 'Suggestions', label: 'Suggestions Moderation', icon: Lightbulb },
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

      {/* PANELS */}
      <div className="mt-6">

        {/* 1. METRICS & TRENDS */}
        {activeTab === 'Metrics' && (
          <div className="space-y-8">
            {loadingStats ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl" />)}
              </div>
            ) : (
              <>
                {/* Statistics KPI section */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                  {[
                    { title: 'Total complaints', count: stats?.totalComplaints || 0, icon: FileText, color: 'text-indigo-500 bg-indigo-500/10' },
                    { title: 'Pending review', count: stats?.pendingComplaints || 0, icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10 border-rose-500/10' },
                    { title: 'In Resolution', count: stats?.inProgressComplaints || 0, icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/10' },
                    { title: 'Resolved tasks', count: stats?.resolvedComplaints || 0, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10' },
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
                        <div className={`p-3.5 rounded-2xl ${card.color} shrink-0`}>
                          <Icon className="h-6 w-6 stroke-[1.8]" />
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</span>
                          <span className="text-xl md:text-2xl font-black text-slate-850 dark:text-white leading-tight mt-1 block">{card.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional campus counts */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 text-left">
                  {[
                    { title: 'Total Registered', val: stats?.totalUsers || 0, label: 'User accounts' },
                    { title: 'Verified Students', val: stats?.totalStudents || 0, label: 'PRN Active' },
                    { title: 'Instructors / Faculty', val: stats?.totalFaculty || 0, label: 'Dept Mentors' },
                    { title: 'Alumni Network', val: stats?.totalAlumni || 0, label: 'Mentors active' },
                    { title: 'Library Books', val: stats?.totalBooks || 0, label: 'Rack cataloged' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl shadow-xs text-center">
                      <span className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">{stat.title}</span>
                      <span className="block text-2xl font-black text-orange-500 mt-1">{stat.val}</span>
                      <span className="block text-[9px] text-slate-400 font-bold">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Chart Trends panels */}
                <div className="grid lg:grid-cols-12 gap-6 text-left">
                  {/* Timeline area trends */}
                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-base font-extrabold text-slate-850 dark:text-white mb-6 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      Daily Complaint filing Trends (Last 7 Days)
                    </h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={timelineData}>
                          <defs>
                            <linearGradient id="adminTrendsGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b1a" className="dark:stroke-slate-800/60" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                          <Area type="monotone" dataKey="complaints" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#adminTrendsGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Distribution list */}
                  <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                    <h3 className="text-base font-extrabold text-slate-850 dark:text-white mb-4">Grievance Category Map</h3>
                    {categoryData.length === 0 ? (
                      <div className="h-60 flex items-center justify-center text-slate-400 text-xs">No active category data logged.</div>
                    ) : (
                      <>
                        <div className="h-52 w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                                {categoryData.map((e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-3 max-h-24 overflow-y-auto">
                          {categoryData.map((item, index) => (
                            <span key={item.name} className="text-[9px] font-extrabold text-slate-500 dark:text-slate-450 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 rounded-full border dark:border-slate-850">
                              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              {item.name} ({item.value})
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. CAMPUS COMPLAINTS DATATABLE */}
        {activeTab === 'Complaints' && (
          <div className="space-y-6">
            {/* Filter board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between text-left">
              <div className="relative flex-1 w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Search student complaints by title/desc..."
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
                <button
                  onClick={() => fetchComplaints(1)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Datatable list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Complaint Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date Filed</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingComplaints ? (
                      [1, 2, 3].map(n => (
                        <tr key={n} className="animate-pulse"><td colSpan={6} className="h-14 bg-slate-100/50 dark:bg-slate-850/20" /></tr>
                      ))
                    ) : complaints.length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-xs">No grievance complaints filed.</td></tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 pl-6">
                            <div>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block">{c.isAnonymous ? 'Anonymous' : c.studentId?.name || 'Academic'}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">{c.studentId?.email || 'pccoer.support'}</span>
                            </div>
                          </td>
                          <td className="p-4 max-w-[200px] truncate">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block truncate">{c.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate">{c.description}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border dark:border-slate-850">{c.category}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 text-[10px] text-slate-450 font-bold">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/complaint/${c._id}`} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-400 hover:text-slate-800 dark:hover:text-white"><Eye className="h-4 w-4" /></Link>
                              <button
                                onClick={() => { setSelectedTicket(c); setStatusForm({ status: c.status, comment: '' }); setShowStatusModal(true); }}
                                className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/40 text-indigo-500 hover:bg-indigo-50"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => { setTicketToDelete(c); setShowDeleteModal(true); }}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pager */}
              {!loadingComplaints && complaints.length > 0 && complaintPagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-250 dark:border-slate-850 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-500">
                  <span>Total records: {complaintPagination.total}</span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={complaintPagination.page === 1}
                      onClick={() => fetchComplaints(complaintPagination.page - 1)}
                      className="p-1.5 rounded-lg border bg-white dark:bg-slate-900 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span>Page {complaintPagination.page} of {complaintPagination.totalPages}</span>
                    <button
                      disabled={complaintPagination.page === complaintPagination.totalPages}
                      onClick={() => fetchComplaints(complaintPagination.page + 1)}
                      className="p-1.5 rounded-lg border bg-white dark:bg-slate-900 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MODERATE TICKET MODAL */}
            <AnimatePresence>
              {showStatusModal && selectedTicket && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-[420px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-850 dark:text-white leading-tight">Resolve Complaint</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedTicket.title}</p>
                      </div>
                      <button onClick={() => { setShowStatusModal(false); setSelectedTicket(null); }} className="p-1 rounded-full text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                    </div>

                    <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Update status</label>
                        <select
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none"
                          value={statusForm.status}
                          onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Progress Comment</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Provide progress updates for student timeline log..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none resize-none"
                          value={statusForm.comment}
                          onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingTicket}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                      >
                        {updatingTicket ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Commit Status Update'}
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* DELETE MODAL */}
            <AnimatePresence>
              {showDeleteModal && ticketToDelete && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-[400px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left"
                  >
                    <h3 className="text-lg font-black text-slate-850 dark:text-white leading-tight">Spam Deletion Action</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Confirm permanent deletion of: <span className="font-bold text-slate-800 dark:text-white">"{ticketToDelete.title}"</span>? This will erase the record completely.
                    </p>
                    <div className="flex justify-end gap-3 pt-3 border-t dark:border-slate-800">
                      <button onClick={() => { setShowDeleteModal(false); setTicketToDelete(null); }} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                      <button
                        onClick={handleDeleteSubmit}
                        disabled={deletingTicket}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors"
                      >
                        Delete Ticket
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 3. USER DIRECTORY */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            {/* Search board */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm flex items-center justify-between text-left">
              <div className="relative flex-1 w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Search user profile name or email..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            {/* Users datatable grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="p-4 pl-6">Profile Details</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Academic PRN</th>
                      <th className="p-4">Authority Role</th>
                      <th className="p-4">Banned / Status</th>
                      <th className="p-4 pr-6 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      [1, 2].map(n => <tr key={n} className="animate-pulse"><td colSpan={6} className="h-14 bg-slate-100/50 dark:bg-slate-850/20" /></tr>)
                    ) : users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-xs">No accounts matches found.</td></tr>
                    ) : (
                      users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map((u) => (
                        <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar || '/pccoerimg.jpeg'} className="h-8 w-8 rounded-full object-cover shadow-xs border" />
                              <div>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block">{u.name}</span>
                                <span className="text-[9px] font-bold text-slate-400 block">{u.dept || 'Engineering Department'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-650 dark:text-slate-350">{u.email}</td>
                          <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400">{u.prn || 'N/A'}</td>
                          <td className="p-4">
                            <select
                              value={u.role}
                              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg py-1 px-2 cursor-pointer"
                              onChange={(e) => changeUserAuthority(u._id, e.target.value)}
                            >
                              <option value="student">Student</option>
                              <option value="faculty">Faculty</option>
                              <option value="alumni">Alumni</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              u.isBanned
                                ? 'bg-red-500/10 text-red-500 border-red-500/25'
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                            }`}>
                              {u.isBanned ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => toggleUserSuspension(u._id)}
                              className={`flex items-center gap-1 py-1.5 px-3 rounded-xl border text-[10px] font-black uppercase ml-auto transition-colors ${
                                u.isBanned
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/25 hover:bg-red-500/20'
                              }`}
                            >
                              <Ban className="h-3 w-3" />
                              <span>{u.isBanned ? 'Re-activate' : 'Suspend Account'}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SUGGESTIONS MODERATION */}
        {activeTab === 'Suggestions' && (
          <div className="space-y-6">
            {loadingSuggestions ? (
              <div className="grid sm:grid-cols-2 gap-6 animate-pulse">
                {[1, 2].map(n => <div key={n} className="h-40 bg-slate-100 dark:bg-slate-900 rounded-2xl" />)}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-3">
                <div className="bg-orange-500/10 text-orange-500 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto"><Lightbulb className="h-6 w-6" /></div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">No suggestions yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">There are no student proposals awaiting review.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {suggestions.map((s) => (
                  <div key={s._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex flex-col justify-between text-left shadow-sm relative">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2.5 py-0.5 rounded-full animate-pulse-slow">
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
                        By: <span className="font-bold">{s.studentName}</span> • Upvotes: <span className="font-black text-orange-500">{s.votes}</span>
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moderateSuggestionStatus(s._id, 'Approved')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded-lg text-[10px] transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => moderateSuggestionStatus(s._id, 'Implemented')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg text-[10px] transition-colors"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          <span>Implement</span>
                        </button>
                        <button
                          onClick={() => moderateSuggestionStatus(s._id, 'Spam')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-lg text-[10px] transition-colors"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Spam</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
